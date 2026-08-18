'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
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

export async function updateProfile(raw: unknown): Promise<ActionResult<null>> {
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
        onboardedAt: session.onboardedAt ?? new Date(),
      },
    });
  } catch (err) {
    logger.error('profile.update.failed', { userId: session.id, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not save your profile.' } };
  }

  logger.info('profile.updated', { userId: session.id });
  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return { ok: true, data: null };
}
