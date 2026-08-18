import Link from 'next/link';
import type { Scholarship } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { FundingBadge } from '@/components/scholarship/FundingBadge';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { EligibilityBadge } from '@/components/scholarship/EligibilityBadge';
import { SaveButton } from '@/components/scholarship/SaveButton';
import { CompareButton } from '@/components/scholarship/CompareButton';
import type { EligibilityResult } from '@/lib/eligibility';
import { STUDY_LEVEL_LABELS } from '@/lib/constants';

type ScholarshipCardProps = {
  // required props first
  scholarship: Scholarship;
  isLoggedIn: boolean;
  isSaved: boolean;
  isComparing: boolean;
  // optional props after
  eligibility?: EligibilityResult | null;
  /** The current discovery URL (path + query), so the detail page can
   *  offer an explicit way back to this exact search/sort/filter state. */
  returnTo?: string;
};

export function ScholarshipCard({
  scholarship,
  isLoggedIn,
  isSaved,
  isComparing,
  eligibility,
  returnTo,
}: ScholarshipCardProps) {
  const detailHref = returnTo
    ? `/scholarships/${scholarship.slug}?from=${encodeURIComponent(returnTo)}`
    : `/scholarships/${scholarship.slug}`;

  return (
    <Card className="relative flex flex-col gap-12">
      <Link
        href={detailHref}
        aria-label={scholarship.title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo"
      />

      <div className="flex select-none items-start justify-between gap-12">
        <div className="min-w-0">
          <p className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
            {scholarship.provider}
          </p>
          <h3
            className="line-clamp-2 text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            {scholarship.title}
          </h3>
        </div>
        <div className="relative z-20">
          <SaveButton scholarshipId={scholarship.id} initialSaved={isSaved} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <div className="pointer-events-none flex flex-wrap gap-8">
        <FundingBadge level={scholarship.fundingLevel} />
        {eligibility !== undefined && <EligibilityBadge result={eligibility ?? null} />}
      </div>

      <p className="select-none text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
        {scholarship.studyLevels.map((level) => STUDY_LEVEL_LABELS[level]).join(', ')} ·{' '}
        {scholarship.hostCountry}
      </p>

      <div className="pointer-events-none">
        <DeadlineBadge deadlineAt={scholarship.deadlineAt} status={scholarship.status} />
      </div>

      <div className="relative z-20 mt-auto pt-8">
        <CompareButton scholarshipId={scholarship.id} initialSelected={isComparing} />
      </div>
    </Card>
  );
}
