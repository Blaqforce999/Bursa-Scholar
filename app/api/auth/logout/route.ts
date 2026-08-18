import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await destroySession();
    logger.info('auth.logout');
    return NextResponse.json({ ok: true, data: null }, { status: 200 });
  } catch (err) {
    logger.error('auth.logout.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
