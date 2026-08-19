import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { clearCompare } from '@/lib/compare';
import { env } from '@/lib/env';

export const SESSION_COOKIE = 'bursa_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, per security.md

/**
 * A second CSRF layer alongside the session cookie's sameSite=lax: modern
 * browsers send Origin on every same-origin POST/fetch, not just
 * cross-origin ones, so a mismatched Origin is a reliable signal of a
 * cross-site request. Missing Origin (some non-browser clients) is allowed
 * through rather than blocked, sameSite already covers the browser case.
 */
export function isTrustedOrigin(req: { headers: Headers }): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  return origin === env.NEXT_PUBLIC_APP_URL;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({ data: { token, userId, expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  // A new session must never inherit whatever the previous session (or an
  // anonymous visit) left in the compare cookie on this browser.
  await clearCompare();
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { token } });
    return null;
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
  await clearCompare();
}
