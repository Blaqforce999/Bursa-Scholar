'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { ActionResult } from '@/lib/types';

const inputSchema = z.object({
  nationality: z.string().min(2).optional().or(z.literal('')),
  studyLevel: z.enum(['UNDERGRADUATE', 'MASTERS', 'PHD', 'RESEARCH']).optional().or(z.literal('')),
  fieldOfStudy: z.string().min(2).max(120).optional().or(z.literal('')),
  targetRegion: z.string().max(120).optional().or(z.literal('')),
});

export async function completeOnboarding(raw: unknown): Promise<ActionResult<null> | void> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'Please check your answers.' } };
  }

  try {
    await db.user.update({
      where: { id: session.id },
      data: {
        nationality: parsed.data.nationality || null,
        studyLevel: parsed.data.studyLevel || null,
        fieldOfStudy: parsed.data.fieldOfStudy || null,
        targetRegion: parsed.data.targetRegion || null,
        onboardedAt: new Date(),
      },
    });

    logger.info('onboarding.completed', { userId: session.id });
  } catch (err) {
    logger.error('onboarding.failed', { userId: session.id, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not save your profile.' } };
  }

  redirect('/dashboard');
}

export async function skipOnboarding(): Promise<ActionResult<null> | void> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } };

  await db.user.update({ where: { id: session.id }, data: { onboardedAt: new Date() } });
  redirect('/dashboard');
}
