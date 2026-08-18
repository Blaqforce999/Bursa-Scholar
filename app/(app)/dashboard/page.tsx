import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Scholarship } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { searchScholarships, searchAllScholarships, getFilterOptions } from '@/lib/scholarships';
import { getEligibility, type EligibilityResult } from '@/lib/eligibility';
import { CLOSING_SOON_WINDOW_DAYS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { DashboardScholarshipCard } from '@/components/dashboard/DashboardScholarshipCard';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { AskBursaButton } from '@/components/dashboard/AskBursaButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';

const CLOSING_SOON_WINDOW_MS = CLOSING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const TABS = [
  { key: 'for-you', label: 'For you' },
  { key: 'closing-soon', label: 'Closing soon' },
  { key: 'all', label: 'All scholarships' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    sort?: string;
    funding?: string;
    studyLevel?: string;
    hostCountry?: string;
    region?: string;
    fieldOfStudy?: string;
  }>;
};

export default async function DashboardHomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (!user.onboardedAt) redirect('/onboarding');

  const activeTab: TabKey = TABS.some((tab) => tab.key === params.tab) ? (params.tab as TabKey) : 'for-you';
  const dashboardQuery = new URLSearchParams(params as Record<string, string>).toString();
  const returnTo = dashboardQuery ? `/dashboard?${dashboardQuery}` : '/dashboard';
  const profile = { nationality: user.nationality, studyLevel: user.studyLevel, fieldOfStudy: user.fieldOfStudy };
  const hasProfile = Boolean(user.nationality || user.studyLevel || user.fieldOfStudy);
  const hasActiveSearchOrFilter = Boolean(
    params.q || params.funding || params.studyLevel || params.hostCountry || params.region || params.fieldOfStudy
  );

  const [{ scholarships }, allMatching, filterOptions, savedRows] = await Promise.all([
    searchScholarships(params),
    searchAllScholarships(params),
    getFilterOptions(),
    db.savedScholarship.findMany({ where: { userId: user.id }, select: { scholarshipId: true } }),
  ]);
  const savedIds = new Set(savedRows.map((row) => row.scholarshipId));

  const FOR_YOU_LIMIT = 12;
  const allPublished = allMatching.filter((scholarship) => scholarship.status === 'PUBLISHED');

  // Rank by genuine relevance: full matches first, then partial matches
  // (where the profile is too incomplete to confirm every criterion),
  // each group keeping the query's own ordering (deadline by default).
  // Scholarships that are a confirmed non-match never appear here.
  const relevanceRank: Record<EligibilityResult['state'], number> = { ELIGIBLE: 0, PARTIAL: 1, NOT_ELIGIBLE: 2 };
  const forYouMatches = hasProfile
    ? allPublished
        .map((scholarship) => ({ scholarship, eligibility: getEligibility(profile, scholarship) }))
        .filter((row) => row.eligibility && row.eligibility.state !== 'NOT_ELIGIBLE')
        .sort((a, b) => relevanceRank[a.eligibility!.state] - relevanceRank[b.eligibility!.state])
        .slice(0, FOR_YOU_LIMIT)
        .map((row) => row.scholarship)
    : [];
  const closingSoonMatches = allPublished.filter(isClosingSoon);

  const tabScholarships: Scholarship[] =
    activeTab === 'for-you' ? forYouMatches : activeTab === 'closing-soon' ? closingSoonMatches : scholarships;

  const showMatchClause = hasProfile && forYouMatches.length > 0;
  const showClosingClause = closingSoonMatches.length > 0;

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
          </p>
          <h1
            className="mt-4 text-ink-indigo"
            style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
          >
            Discover scholarships
          </h1>
          {(showMatchClause || showClosingClause) && (
            <p className="mt-4 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
              {showMatchClause && (
                <>
                  <span className="text-ink-indigo" style={{ font: 'var(--font-data-regular)' }}>
                    {forYouMatches.length}
                  </span>{' '}
                  match your profile
                </>
              )}
              {showMatchClause && showClosingClause && <span className="px-6">·</span>}
              {showClosingClause && (
                <span className="text-danger">
                  <span style={{ font: 'var(--font-data-regular)' }}>{closingSoonMatches.length}</span> closing soon
                </span>
              )}
            </p>
          )}
        </div>
        <AskBursaButton />
      </div>

      <div className="flex gap-24 overflow-x-auto border-b border-border-faint" aria-label="Scholarship views">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={buildTabHref(tab.key, params)}
            className={cn(
              'shrink-0 border-b-2 pb-12 text-ink-muted transition',
              activeTab === tab.key ? 'border-ink-indigo text-ink-indigo' : 'border-transparent hover:text-ink-indigo'
            )}
            style={{ font: 'var(--font-button-label)' }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <DashboardControls
        hostCountries={filterOptions.hostCountries}
        regions={filterOptions.regions}
        fieldsOfStudy={filterOptions.fieldsOfStudy}
      />

      {tabScholarships.length === 0 ? (
        <DashboardEmptyState tab={activeTab} hasProfile={hasProfile} hasQuery={hasActiveSearchOrFilter} />
      ) : (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {tabScholarships.map((scholarship) => (
            <DashboardScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              isSaved={savedIds.has(scholarship.id)}
              eligibility={hasProfile ? getEligibility(profile, scholarship) : null}
              returnTo={returnTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isClosingSoon(scholarship: Pick<Scholarship, 'deadlineAt'>) {
  if (!scholarship.deadlineAt) return false;
  const msLeft = scholarship.deadlineAt.getTime() - Date.now();
  return msLeft > 0 && msLeft < CLOSING_SOON_WINDOW_MS;
}

function buildTabHref(tab: TabKey, currentParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([key, value]) => {
    if (value && key !== 'tab') params.set(key, value);
  });
  if (tab !== 'for-you') params.set('tab', tab);
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : '/dashboard';
}

function DashboardEmptyState({ tab, hasProfile, hasQuery }: { tab: TabKey; hasProfile: boolean; hasQuery: boolean }) {
  if (hasQuery) {
    return (
      <EmptyState
        title="No matches right now"
        body="Try a different search term or loosen a filter, or browse everything below."
        action={
          <ButtonLink href="/dashboard" variant="secondary">
            Clear search and filters
          </ButtonLink>
        }
      />
    );
  }

  if (tab === 'for-you' && !hasProfile) {
    return (
      <EmptyState
        title="Add your profile to see eligibility"
        body="Nationality, study level, and field of study power your Eligible for you and Partial match labels."
        action={
          <ButtonLink href="/profile" variant="secondary">
            Add your profile
          </ButtonLink>
        }
      />
    );
  }

  if (tab === 'for-you') {
    return (
      <EmptyState
        title="No clear matches yet"
        body="Browse the full list. Some options may not fully match your profile but could still be worth a look."
        action={
          <ButtonLink href="/dashboard?tab=all" variant="secondary">
            Browse all scholarships
          </ButtonLink>
        }
      />
    );
  }

  if (tab === 'closing-soon') {
    return (
      <EmptyState
        title="Nothing closing soon"
        body="Nothing is closing in the next two weeks. Check back soon, or browse everything."
        action={
          <ButtonLink href="/dashboard?tab=all" variant="secondary">
            Browse all scholarships
          </ButtonLink>
        }
      />
    );
  }

  return <EmptyState title="No scholarships yet" body="Nothing's published yet. Check back soon." />;
}
