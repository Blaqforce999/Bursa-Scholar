'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { addToCompare, removeFromCompare } from '@/lib/compare';
import type { ActionResult } from '@/lib/types';

export async function toggleCompare(scholarshipId: string, currentlySelected: boolean) {
  const result = currentlySelected ? await removeFromCompare(scholarshipId) : await addToCompare(scholarshipId);
  revalidatePath('/compare');
  return result;
}

export async function saveScholarship(scholarshipId: string): Promise<ActionResult<{ saved: true }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in to save scholarships.' } };

  try {
    await db.savedScholarship.create({
      data: { userId: session.id, scholarshipId },
    });
  } catch (err) {
    // P2002 = unique constraint violation — already saved, treat as a clean no-op.
    if (!(err instanceof Error) || !('code' in err) || err.code !== 'P2002') {
      logger.error('scholarship.save.failed', { userId: session.id, scholarshipId, error: err });
      return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not save this scholarship.' } };
    }
  }

  logger.info('scholarship.saved', { userId: session.id, scholarshipId });
  revalidatePath('/saved');
  return { ok: true, data: { saved: true } };
}

export async function unsaveScholarship(scholarshipId: string): Promise<ActionResult<{ saved: false }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in to manage saved scholarships.' } };

  await db.savedScholarship.deleteMany({
    where: { userId: session.id, scholarshipId },
  });

  logger.info('scholarship.unsaved', { userId: session.id, scholarshipId });
  revalidatePath('/saved');
  return { ok: true, data: { saved: false } };
}
