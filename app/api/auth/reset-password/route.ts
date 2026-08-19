import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { hashPassword, isTrustedOrigin } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { consumePasswordResetToken } from '@/lib/password-reset';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    // Dormant while EMAIL_VERIFICATION_ENABLED is off, matching
    // forgot-password: there is no way to reach a valid token without
    // that flow having run, but this stays defense in depth.
    if (!env.EMAIL_VERIFICATION_ENABLED) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_AVAILABLE', message: 'Password reset is not available yet.' } },
        { status: 404 }
      );
    }

    if (!isTrustedOrigin(req)) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Request rejected.' } },
        { status: 403 }
      );
    }

    if (!rateLimit(`reset-password:${getClientIp(req)}`, 10, 60_000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Enter a new password of at least 8 characters.' } },
        { status: 400 }
      );
    }

    const consumed = await consumePasswordResetToken(parsed.data.token);
    if (!consumed.ok) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TOKEN', message: 'This reset link is invalid or has expired.' } },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({ where: { id: consumed.userId }, data: { passwordHash: newPasswordHash } });
    // A password reset means the account may have been compromised, or the
    // owner simply forgot it, either way every existing session (there is
    // no session on this device during this flow) should be invalidated.
    await db.session.deleteMany({ where: { userId: consumed.userId } });

    logger.info('password.reset.completed', { userId: consumed.userId });
    return NextResponse.json({ ok: true, data: null }, { status: 200 });
  } catch (err) {
    logger.error('password.reset.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
