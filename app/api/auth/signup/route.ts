import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  try {
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
