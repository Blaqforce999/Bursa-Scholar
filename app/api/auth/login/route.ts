import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
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
