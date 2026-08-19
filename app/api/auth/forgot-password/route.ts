import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { isTrustedOrigin } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { createPasswordResetToken } from '@/lib/password-reset';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  email: z.string().email(),
});

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

// Always the same response regardless of what actually happened, so a
// caller can never learn whether an email address has a Bursa account.
const GENERIC_RESPONSE = NextResponse.json(
  { ok: true, data: { message: 'If an account exists for that email, a reset link has been sent.' } },
  { status: 200 }
);

export async function POST(req: NextRequest) {
  try {
    // Dormant while EMAIL_VERIFICATION_ENABLED is off — no domain is
    // verified with Resend yet, so this must not run for real.
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

    if (!rateLimit(`forgot-password:${getClientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return GENERIC_RESPONSE;
    }

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const rawToken = await createPasswordResetToken(user.id);
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
      const result = await sendEmail({
        to: user.email,
        subject: 'Reset your Bursa password',
        html: `<p>Someone asked to reset the password for this Bursa account. If this was you, use the link below within 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
      if (!result.ok) {
        logger.error('password.reset.email_failed', { userId: user.id, error: result.error });
      } else {
        logger.info('password.reset.requested', { userId: user.id });
      }
    }

    return GENERIC_RESPONSE;
  } catch (err) {
    logger.error('password.reset.request_failed', { error: err });
    return GENERIC_RESPONSE;
  }
}
