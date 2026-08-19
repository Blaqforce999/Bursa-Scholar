import { NextRequest, NextResponse } from 'next/server';
import { destroySession, isTrustedOrigin } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Request rejected.' } },
        { status: 403 }
      );
    }

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
