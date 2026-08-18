import { NextRequest, NextResponse } from 'next/server';
import { searchScholarships } from '@/lib/scholarships';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = await searchScholarships(params);

    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (err) {
    logger.error('scholarships.search.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
