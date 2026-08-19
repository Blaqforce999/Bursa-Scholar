import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, createSession, isTrustedOrigin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

const inputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/** No session exists yet at signup time, so the limiter is keyed by IP
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

    if (!rateLimit(`signup:${getClientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Enter a valid email and a password of at least 8 characters.' } },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, passwordHash },
    });

    await createSession(user.id);

    logger.info('auth.signup', { userId: user.id });
    return NextResponse.json(
      { ok: true, data: { id: user.id, onboarded: Boolean(user.onboardedAt) } },
      { status: 200 }
    );
  } catch (err) {
    logger.error('auth.signup.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
