import { db } from '@/lib/db';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;

  while (
    await db.scholarship.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
