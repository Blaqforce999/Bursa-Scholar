'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { generateUniqueSlug } from '@/lib/slug';
import { logger } from '@/lib/logger';
import type { ActionResult } from '@/lib/types';

const httpsUrl = z.string().url().refine((url) => url.startsWith('https://'), {
  message: 'Must be a secure https:// URL.',
});

const csv = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const scholarshipSchema = z.object({
  title: z.string().min(3).max(200),
  provider: z.string().min(2).max(200),
  officialUrl: httpsUrl,
  applicationUrl: z.union([httpsUrl, z.literal('')]).optional(),
  fundingLevel: z.enum(['FULL', 'PARTIAL', 'TUITION_ONLY', 'STIPEND']),
  studyLevels: z.string().min(1),
  fieldsOfStudy: z.string().min(1),
  hostCountry: z.string().min(2).max(120),
  region: z.string().min(2).max(120),
  eligibleNationalities: z.string().optional().or(z.literal('')),
  openToAllAfrican: z.union([z.literal('on'), z.literal('')]).optional(),
  benefits: z.string().min(10),
  eligibility: z.string().min(10),
  requirements: z.string().min(10),
  deadlineAt: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']),
  source: z.string().min(3).max(200),
});

function parseStudyLevels(raw: string) {
  const allowed = ['UNDERGRADUATE', 'MASTERS', 'PHD', 'RESEARCH'];
  return csv(raw)
    .map((s) => s.toUpperCase())
    .filter((s): s is 'UNDERGRADUATE' | 'MASTERS' | 'PHD' | 'RESEARCH' => allowed.includes(s));
}

export async function createScholarship(raw: unknown): Promise<ActionResult<null> | void> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } };

  const parsed = scholarshipSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Please check the form.' } };
  }

  const data = parsed.data;
  const slug = await generateUniqueSlug(data.title);

  let created;
  try {
    created = await db.scholarship.create({
      data: {
        title: data.title,
        slug,
        provider: data.provider,
        officialUrl: data.officialUrl,
        applicationUrl: data.applicationUrl || null,
        fundingLevel: data.fundingLevel,
        studyLevels: parseStudyLevels(data.studyLevels),
        fieldsOfStudy: csv(data.fieldsOfStudy),
        hostCountry: data.hostCountry,
        region: data.region,
        eligibleNationalities: data.eligibleNationalities ? csv(data.eligibleNationalities) : [],
        openToAllAfrican: data.openToAllAfrican === 'on',
        benefits: data.benefits,
        eligibility: data.eligibility,
        requirements: data.requirements,
        deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
        status: data.status,
        source: data.source,
      },
    });
  } catch (err) {
    logger.error('admin.scholarship.create.failed', { adminId: admin.id, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not create the scholarship.' } };
  }

  logger.info('admin.scholarship.created', { adminId: admin.id, scholarshipId: created.id });
  revalidatePath('/admin/scholarships');
  revalidatePath('/scholarships');
  revalidatePath('/');
  redirect('/admin/scholarships');
}

export async function updateScholarship(scholarshipId: string, raw: unknown): Promise<ActionResult<null> | void> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } };

  const parsed = scholarshipSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Please check the form.' } };
  }

  const existing = await db.scholarship.findUnique({ where: { id: scholarshipId } });
  if (!existing) return { ok: false, error: { code: 'NOT_FOUND', message: 'Scholarship not found.' } };

  const data = parsed.data;
  const slug = data.title !== existing.title ? await generateUniqueSlug(data.title, scholarshipId) : existing.slug;

  try {
    await db.scholarship.update({
      where: { id: scholarshipId },
      data: {
        title: data.title,
        slug,
        provider: data.provider,
        officialUrl: data.officialUrl,
        applicationUrl: data.applicationUrl || null,
        fundingLevel: data.fundingLevel,
        studyLevels: parseStudyLevels(data.studyLevels),
        fieldsOfStudy: csv(data.fieldsOfStudy),
        hostCountry: data.hostCountry,
        region: data.region,
        eligibleNationalities: data.eligibleNationalities ? csv(data.eligibleNationalities) : [],
        openToAllAfrican: data.openToAllAfrican === 'on',
        benefits: data.benefits,
        eligibility: data.eligibility,
        requirements: data.requirements,
        deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
        status: data.status,
        source: data.source,
      },
    });
  } catch (err) {
    logger.error('admin.scholarship.update.failed', { adminId: admin.id, scholarshipId, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not update the scholarship.' } };
  }

  logger.info('admin.scholarship.updated', { adminId: admin.id, scholarshipId });
  revalidatePath('/admin/scholarships');
  revalidatePath('/scholarships');
  revalidatePath(`/scholarships/${slug}`);
  revalidatePath('/');
  redirect('/admin/scholarships');
}

export async function setScholarshipStatus(
  scholarshipId: string,
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } };

  await db.scholarship.update({ where: { id: scholarshipId }, data: { status } });

  logger.info('admin.scholarship.status_changed', { adminId: admin.id, scholarshipId, status });
  revalidatePath('/admin/scholarships');
  revalidatePath('/scholarships');
  revalidatePath('/');
  return { ok: true, data: null };
}

export async function verifyScholarship(scholarshipId: string): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } };

  await db.scholarship.update({ where: { id: scholarshipId }, data: { verifiedAt: new Date() } });

  logger.info('admin.scholarship.verified', { adminId: admin.id, scholarshipId });
  revalidatePath('/admin/scholarships');
  return { ok: true, data: null };
}
