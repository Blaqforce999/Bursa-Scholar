import { z } from 'zod';
import { db } from '@/lib/db';
import type { SortOption } from '@/lib/constants';
import type { FundingLevel, StudyLevel, ScholarshipStatus, Prisma, Scholarship } from '@prisma/client';

/**
 * Controlled alias map for country name variants — deliberately small and
 * exact-match only (the whole search box must equal an alias), not fuzzy
 * matching, so search stays precise rather than broadening recall.
 */
const COUNTRY_ALIASES: Record<string, string[]> = {
  'United States': ['us', 'usa', 'u.s.', 'u.s.a.', 'america', 'united states of america'],
  'United Kingdom': ['uk', 'u.k.', 'britain', 'great britain', 'england'],
  'United Arab Emirates': ['uae', 'u.a.e.'],
  'South Korea': ['korea', 'republic of korea'],
  'Cote d’Ivoire': ['ivory coast', "cote d'ivoire", "côte d'ivoire", 'cote divoire'],
};

function resolveCountryAliases(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  return Object.entries(COUNTRY_ALIASES)
    .filter(([canonical, aliases]) => canonical.toLowerCase() === normalized || aliases.includes(normalized))
    .map(([canonical]) => canonical);
}

export const scholarshipFiltersSchema = z.object({
  q: z.string().max(120).optional(),
  funding: z.enum(['FULL', 'PARTIAL', 'TUITION_ONLY', 'STIPEND']).optional(),
  studyLevel: z.enum(['UNDERGRADUATE', 'MASTERS', 'PHD', 'RESEARCH']).optional(),
  hostCountry: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  fieldOfStudy: z.string().max(120).optional(),
  nationality: z.string().max(120).optional(),
  deadlineWithinDays: z.coerce.number().int().positive().max(365).optional(),
  sort: z.enum(['deadline-asc', 'deadline-desc', 'recent', 'az']).optional(),
  page: z.coerce.number().int().positive().max(1000).optional(),
});

export type ScholarshipFilters = z.infer<typeof scholarshipFiltersSchema>;

const PAGE_SIZE = 12;
const PUBLIC_STATUSES: ScholarshipStatus[] = ['PUBLISHED', 'CLOSED'];

function orderByFor(sort: SortOption | undefined): Prisma.ScholarshipOrderByWithRelationInput[] {
  // Open opportunities always surface before closed ones, regardless of
  // sort — a "recently added" or "A–Z" sort shouldn't bury live listings
  // under expired ones.
  switch (sort) {
    case 'deadline-desc':
      return [{ status: 'asc' }, { deadlineAt: 'desc' }];
    case 'recent':
      return [{ status: 'asc' }, { createdAt: 'desc' }];
    case 'az':
      return [{ status: 'asc' }, { title: 'asc' }];
    case 'deadline-asc':
    default:
      return [{ status: 'asc' }, { deadlineAt: 'asc' }];
  }
}

function buildWhereClause(filters: ScholarshipFilters): Prisma.ScholarshipWhereInput {
  // Each active filter dimension is its own AND'd clause (with an OR only
  // *within* a dimension, e.g. "field matches OR scholarship is open to any
  // field") — combining a free-text search with an explicit filter should
  // narrow results, not broaden them by OR-ing unrelated conditions together.
  const and: Prisma.ScholarshipWhereInput[] = [{ status: { in: PUBLIC_STATUSES } }];

  if (filters.q) {
    const q = filters.q.trim();
    const aliasedCountries = resolveCountryAliases(q);
    // A resolved alias (e.g. "US", "UAE") is a precise, controlled match on
    // its own — it must NOT also fall through to a raw substring search,
    // since short alias tokens like "us" are common substrings of unrelated
    // words ("Australia", "Erasmus") and would otherwise pollute results.
    and.push(
      aliasedCountries.length > 0
        ? { OR: aliasedCountries.map((country) => ({ hostCountry: country })) }
        : {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { provider: { contains: q, mode: 'insensitive' } },
              { hostCountry: { contains: q, mode: 'insensitive' } },
              { region: { contains: q, mode: 'insensitive' } },
            ],
          }
    );
  }
  if (filters.funding) and.push({ fundingLevel: filters.funding as FundingLevel });
  if (filters.studyLevel) and.push({ studyLevels: { has: filters.studyLevel as StudyLevel } });
  if (filters.hostCountry) and.push({ hostCountry: filters.hostCountry });
  if (filters.region) and.push({ region: filters.region });
  if (filters.fieldOfStudy) {
    and.push({
      OR: [{ fieldsOfStudy: { has: filters.fieldOfStudy } }, { fieldsOfStudy: { has: 'Any field' } }],
    });
  }
  if (filters.nationality) {
    and.push({
      OR: [{ eligibleNationalities: { has: filters.nationality } }, { openToAllAfrican: true }],
    });
  }
  if (filters.deadlineWithinDays) {
    const cutoff = new Date(Date.now() + filters.deadlineWithinDays * 24 * 60 * 60 * 1000);
    and.push({ deadlineAt: { lte: cutoff, gte: new Date() } });
  }

  return { AND: and };
}

/**
 * Ranks a text-search match: exact/leading title matches first, then other
 * title matches, then provider, then host country/region — so "Kenya"
 * surfaces Kenya-hosted scholarships even when the word never appears in
 * a title, without burying title matches under them.
 */
function relevanceScore(scholarship: Scholarship, query: string, aliasedCountries: string[]): number {
  const q = query.toLowerCase();
  const title = scholarship.title.toLowerCase();
  let score = 0;

  if (title.startsWith(q)) score += 4;
  else if (title.includes(q)) score += 3;
  if (scholarship.provider.toLowerCase().includes(q)) score += 2;
  if (
    scholarship.hostCountry.toLowerCase().includes(q) ||
    aliasedCountries.includes(scholarship.hostCountry) ||
    scholarship.region.toLowerCase().includes(q)
  ) {
    score += 1;
  }

  return score;
}

async function fetchMatching(filters: ScholarshipFilters): Promise<Scholarship[]> {
  const where = buildWhereClause(filters);
  const rows = await db.scholarship.findMany({ where, orderBy: orderByFor(filters.sort) });

  // Relevance ranking only kicks in as the *default* ordering for a text
  // search — an explicit sort choice (A–Z, deadline, recent) always wins.
  if (filters.q && !filters.sort) {
    const q = filters.q.trim();
    const aliasedCountries = resolveCountryAliases(q);
    return rows
      .map((scholarship, index) => ({ scholarship, index, score: relevanceScore(scholarship, q, aliasedCountries) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((row) => row.scholarship);
  }

  return rows;
}

export async function searchScholarships(rawFilters: Record<string, string | undefined>) {
  const parsed = scholarshipFiltersSchema.safeParse(rawFilters);
  const filters = parsed.success ? parsed.data : {};
  const page = filters.page ?? 1;

  // "Load more" accumulates rather than paginates: page N returns the
  // first N * PAGE_SIZE results, so each click grows the same visible
  // list instead of replacing it.
  const all = await fetchMatching(filters);
  const total = all.length;
  const scholarships = all.slice(0, page * PAGE_SIZE);

  return {
    scholarships,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    hasMore: page * PAGE_SIZE < total,
  };
}

/**
 * Unpaged variant for views that need to reason about the *whole* matching
 * set rather than one page of it — e.g. the dashboard's "For you" and
 * "Closing soon" tabs, which rank/filter by eligibility or deadline across
 * every match, not just the first PAGE_SIZE fetched.
 */
export async function searchAllScholarships(rawFilters: Record<string, string | undefined>) {
  const parsed = scholarshipFiltersSchema.safeParse(rawFilters);
  const filters = parsed.success ? parsed.data : {};

  return fetchMatching(filters);
}

export async function getScholarshipBySlug(slug: string) {
  return db.scholarship.findFirst({
    where: { slug, status: { in: PUBLIC_STATUSES } },
  });
}

export async function getFilterOptions() {
  const scholarships = await db.scholarship.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    select: { hostCountry: true, region: true, fieldsOfStudy: true },
  });

  return {
    hostCountries: Array.from(new Set(scholarships.map((s) => s.hostCountry))).sort(),
    regions: Array.from(new Set(scholarships.map((s) => s.region))).sort(),
    fieldsOfStudy: Array.from(new Set(scholarships.flatMap((s) => s.fieldsOfStudy))).sort(),
  };
}
