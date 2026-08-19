import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, createSession, isTrustedOrigin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** No session exists yet at login time, so the limiter is keyed by IP
 *  (via the proxy-set header, standard on Vercel) rather than user id. */
function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Request rejected.' } },
        { status: 403 }
      );
    }

    if (!rateLimit(`login:${getClientIp(req)}`, 10, 60_000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Enter your email and password.' } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    const validPassword = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !validPassword) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } },
        { status: 401 }
      );
    }

    await createSession(user.id);

    logger.info('auth.login', { userId: user.id });
    return NextResponse.json(
      { ok: true, data: { id: user.id, onboarded: Boolean(user.onboardedAt) } },
      { status: 200 }
    );
  } catch (err) {
    logger.error('auth.login.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
