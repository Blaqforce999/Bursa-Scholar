import Link from 'next/link';
import type { Scholarship } from '@prisma/client';
import { cn } from '@/lib/cn';
import { providerMonogram } from '@/lib/format';
import {
  FUNDING_LEVEL_LABELS,
  STUDY_LEVEL_LABELS,
  CLOSING_SOON_WINDOW_DAYS,
  DEADLINE_URGENT_WINDOW_DAYS,
} from '@/lib/constants';
import { DashboardSaveButton } from '@/components/dashboard/DashboardSaveButton';
import { ClockIcon } from '@/components/shared/icons';
import type { EligibilityResult } from '@/lib/eligibility';

const CLOSING_SOON_WINDOW_MS = CLOSING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const URGENT_WINDOW_MS = DEADLINE_URGENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

type DashboardScholarshipCardProps = {
  // required props first
  scholarship: Scholarship;
  isSaved: boolean;
  // optional props after
  eligibility?: EligibilityResult | null;
  /** The current dashboard URL (tab/search state), so the detail page
   *  can offer an explicit way back to this exact view. */
  returnTo?: string;
};

/**
 * The "Clean feed" dashboard card — logo/text only, no badge stacks or
 * compare button on the face. The whole card is a stretched link to the
 * detail page; the save control sits above it in stacking order so its
 * own click doesn't also trigger the card's navigation.
 */
export function DashboardScholarshipCard({ scholarship, isSaved, eligibility, returnTo }: DashboardScholarshipCardProps) {
  const deadline = getDeadlineInfo(scholarship);
  const detailHref = returnTo
    ? `/scholarships/${scholarship.slug}?from=${encodeURIComponent(returnTo)}`
    : `/scholarships/${scholarship.slug}`;

  return (
    <article className="group relative flex select-none flex-col gap-12 rounded-2xl border border-border bg-surface-white p-20 transition hover:border-border-firm active:bg-surface-warm-light">
      <Link
        href={detailHref}
        aria-label={scholarship.title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo"
      />

      <div className="absolute right-16 top-16 z-20">
        <DashboardSaveButton scholarshipId={scholarship.id} initialSaved={isSaved} />
      </div>

      <div className="flex items-center gap-8 pr-32">
        {scholarship.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- curated logos aren't on a configured image domain yet
          <img
            src={scholarship.logoUrl}
            alt={scholarship.provider}
            loading="lazy"
            className="h-28 w-28 shrink-0 rounded-lg object-contain"
          />
        ) : (
          <span
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-ink-indigo/10 text-ink-indigo"
            style={{ font: 'var(--font-caption)' }}
          >
            {providerMonogram(scholarship.provider)}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          {scholarship.provider}
        </span>
      </div>

      <h3
        className="line-clamp-2 min-h-60 text-ink-indigo"
        style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
      >
        {scholarship.title}
      </h3>

      <p className="text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
        <span className="text-ink-indigo">{FUNDING_LEVEL_LABELS[scholarship.fundingLevel]}</span>
        {' · '}
        {scholarship.studyLevels.map((level) => STUDY_LEVEL_LABELS[level]).join('/')}
        {' · '}
        {scholarship.hostCountry}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-border-faint pt-12">
        <span
          className={cn('flex items-center gap-6', deadline.isUrgent ? 'text-danger' : 'text-ink-muted')}
          style={{ font: 'var(--font-data-small)' }}
        >
          <ClockIcon className="h-14 w-14" />
          {deadline.label}
        </span>

        {eligibility && (
          <span className="flex items-center gap-6 text-ink-muted-dark" style={{ font: 'var(--font-caption)' }}>
            <span
              className={cn(
                'h-8 w-8 rounded-full',
                eligibility.state === 'ELIGIBLE'
                  ? 'bg-eligible'
                  : eligibility.state === 'NOT_ELIGIBLE'
                    ? 'bg-ink-muted'
                    : 'bg-ink-muted-light'
              )}
            />
            {eligibility.state === 'ELIGIBLE' ? 'Eligible' : eligibility.state === 'NOT_ELIGIBLE' ? 'Not eligible' : 'Partial match'}
          </span>
        )}
      </div>
    </article>
  );
}

function getDeadlineInfo(scholarship: Pick<Scholarship, 'deadlineAt' | 'status'>) {
  const now = Date.now();
  const isClosed =
    scholarship.status === 'CLOSED' ||
    scholarship.status === 'ARCHIVED' ||
    (scholarship.deadlineAt !== null && scholarship.deadlineAt.getTime() < now);

  if (isClosed) return { label: 'Closed', isUrgent: false };
  if (!scholarship.deadlineAt) return { label: 'Deadline TBC', isUrgent: false };

  const msLeft = scholarship.deadlineAt.getTime() - now;
  const isClosingSoon = msLeft < CLOSING_SOON_WINDOW_MS;
  const isUrgent = msLeft < URGENT_WINDOW_MS;

  if (isClosingSoon) {
    const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
    return { label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`, isUrgent };
  }

  const formatted = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(scholarship.deadlineAt);
  return { label: formatted, isUrgent: false };
}
