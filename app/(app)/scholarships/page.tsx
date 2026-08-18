import Link from 'next/link';
import { searchScholarships, getFilterOptions } from '@/lib/scholarships';
import { getSession } from '@/lib/auth';
import { getCompareIds } from '@/lib/compare';
import { getEligibility } from '@/lib/eligibility';
import { db } from '@/lib/db';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { FilterChip } from '@/components/scholarship/FilterChip';
import { FilterBar } from '@/app/(app)/scholarships/_components/FilterBar';
import { STUDY_LEVEL_LABELS, FUNDING_LEVEL_LABELS } from '@/lib/constants';

const FILTER_LABELS: Record<string, (value: string) => string> = {
  q: (v) => `"${v}"`,
  funding: (v) => FUNDING_LEVEL_LABELS[v as keyof typeof FUNDING_LEVEL_LABELS] ?? v,
  studyLevel: (v) => STUDY_LEVEL_LABELS[v as keyof typeof STUDY_LEVEL_LABELS] ?? v,
  hostCountry: (v) => v,
  region: (v) => v,
  fieldOfStudy: (v) => v,
  deadlineWithinDays: (v) => `Closing within ${v} days`,
};

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ScholarshipsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ scholarships, total, page, hasMore }, filterOptions, user, compareIds] = await Promise.all([
    searchScholarships(params),
    getFilterOptions(),
    getSession(),
    getCompareIds(),
  ]);

  const savedIds = user
    ? new Set(
        (
          await db.savedScholarship.findMany({
            where: { userId: user.id },
            select: { scholarshipId: true },
          })
        ).map((s) => s.scholarshipId)
      )
    : new Set<string>();

  const activeFilters = Object.entries(params).filter(([key, value]) => value && FILTER_LABELS[key]);

  function hrefWithout(key: string) {
    const next = new URLSearchParams(params as Record<string, string>);
    next.delete(key);
    const query = next.toString();
    return query ? `/scholarships?${query}` : '/scholarships';
  }

  function hrefForPage(targetPage: number) {
    const next = new URLSearchParams(params as Record<string, string>);
    next.set('page', String(targetPage));
    return `/scholarships?${next.toString()}`;
  }

  const searchTerm = params.q?.trim();
  const currentQuery = new URLSearchParams(params as Record<string, string>).toString();
  const returnTo = currentQuery ? `/scholarships?${currentQuery}` : '/scholarships';

  return (
    <div>
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Find scholarships
      </h1>
      <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        {total} scholarship{total === 1 ? '' : 's'} available.
      </p>

      <div className="mt-24">
        <FilterBar
          hostCountries={filterOptions.hostCountries}
          regions={filterOptions.regions}
          fieldsOfStudy={filterOptions.fieldsOfStudy}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-16 flex flex-wrap items-center gap-8">
          {activeFilters.map(([key, value]) => (
            <FilterChip key={key} label={FILTER_LABELS[key](value!)} removeHref={hrefWithout(key)} />
          ))}
          <Link href="/scholarships" className="text-ink-muted underline" style={{ font: 'var(--font-caption)' }}>
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-32">
        {scholarships.length === 0 ? (
          searchTerm ? (
            <EmptyState
              title={`No results for "${searchTerm}"`}
              body="Check the spelling, try a shorter term, or clear the search to browse everything."
              action={
                <ButtonLink href="/scholarships" variant="secondary">
                  Clear search
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              title="No scholarships match your filters"
              body="Try loosening a filter to see more opportunities."
              action={
                <ButtonLink href="/scholarships" variant="secondary">
                  Clear filters
                </ButtonLink>
              }
            />
          )
        ) : (
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                isLoggedIn={Boolean(user)}
                isSaved={savedIds.has(scholarship.id)}
                isComparing={compareIds.includes(scholarship.id)}
                returnTo={returnTo}
                eligibility={
                  user
                    ? getEligibility(
                        {
                          nationality: user.nationality,
                          studyLevel: user.studyLevel,
                          fieldOfStudy: user.fieldOfStudy,
                        },
                        scholarship
                      )
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-32 flex flex-col items-center gap-8">
          <ButtonLink href={hrefForPage(page + 1)} variant="secondary">
            Load more
          </ButtonLink>
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
            Showing {scholarships.length} of {total}
          </p>
        </div>
      )}
    </div>
  );
}
