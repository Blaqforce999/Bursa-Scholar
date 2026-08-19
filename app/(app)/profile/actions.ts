'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession, destroySession, verifyPassword, hashPassword, SESSION_COOKIE } from '@/lib/auth';
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

/**
 * Permanently deletes the signed-in user's account. Cascades to their
 * sessions and saved scholarships (Prisma onDelete: Cascade on both
 * relations), then clears the current session cookie. Irreversible by
 * design, this is the confirmed action behind the delete-account dialog,
 * not something reachable without that confirmation step.
 */
export async function deleteAccount(): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } };

  try {
    await db.user.delete({ where: { id: session.id } });
  } catch (err) {
    logger.error('account.delete.failed', { userId: session.id, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not delete your account. Please try again.' } };
  }

  await destroySession();
  logger.info('account.deleted', { userId: session.id });
  return { ok: true, data: null };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

/**
 * Requires the current password (verified via the same bcrypt check as
 * login) before setting a new one. On success, every OTHER session for
 * this user is invalidated (a password change should log out any other
 * signed-in device), but the session making this request is left intact
 * so the user isn't immediately logged out on the device they're using.
 */
export async function changePassword(raw: unknown): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'Enter your current password and a new password of at least 8 characters.' } };
  }

  const validCurrent = await verifyPassword(parsed.data.currentPassword, session.passwordHash);
  if (!validCurrent) {
    return { ok: false, error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' } };
  }

  try {
    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({ where: { id: session.id }, data: { passwordHash: newPasswordHash } });

    const store = await cookies();
    const currentToken = store.get(SESSION_COOKIE)?.value;
    await db.session.deleteMany({
      where: { userId: session.id, ...(currentToken ? { token: { not: currentToken } } : {}) },
    });
  } catch (err) {
    logger.error('password.change.failed', { userId: session.id, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not change your password.' } };
  }

  logger.info('password.changed', { userId: session.id });
  return { ok: true, data: null };
}
