import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { answerAssistantQuery } from '@/lib/assistant';

const inputSchema = z.object({
  message: z.string().min(1).max(500),
});

/**
 * Ask Bursa's only integration seam. Deterministic today — it maps the
 * message to existing search/eligibility filters and returns real,
 * curated scholarships. A generative model could sit behind
 * answerAssistantQuery() later without this route, the UI, or the
 * response contract changing; none is wired in yet.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } },
        { status: 401 }
      );
    }

    if (!rateLimit(`assistant:${session.id}`, 20, 60_000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many questions at once — try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Ask a real question.' } },
        { status: 400 }
      );
    }

    const answer = await answerAssistantQuery(parsed.data.message, {
      nationality: session.nationality,
      studyLevel: session.studyLevel,
      fieldOfStudy: session.fieldOfStudy,
    });

    logger.info('assistant.answered', { userId: session.id, resultCount: answer.results.length });
    return NextResponse.json({ ok: true, data: answer }, { status: 200 });
  } catch (err) {
    logger.error('assistant.failed', { error: err });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
