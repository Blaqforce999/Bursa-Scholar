'use client';

import { useState } from 'react';
import type { Scholarship } from '@prisma/client';
import { providerMonogram } from '@/lib/format';
import { STUDY_LEVEL_LABELS } from '@/lib/constants';
import { FundingBadge } from '@/components/scholarship/FundingBadge';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { Button } from '@/components/ui/Button';
import { ScholarshipAuthModal } from '@/components/marketing/ScholarshipAuthModal';

type FeaturedScholarshipsGridProps = {
  scholarships: Scholarship[];
};

/**
 * The public preview grid on the landing page. It's a real, honest sample
 * of live Bursa scholarships — never mock data — but "Load more" never
 * actually loads more; it's the one place unauthenticated visitors are
 * asked to sign up, framed as an invitation rather than a wall.
 */
export function FeaturedScholarshipsGrid({ scholarships }: FeaturedScholarshipsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((scholarship) => (
          <div key={scholarship.id} className="flex flex-col gap-12 rounded-2xl border border-border bg-surface-white p-20">
            <div className="flex items-center gap-8">
              <span
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-ink-indigo/10 text-ink-indigo"
                style={{ font: 'var(--font-caption)' }}
              >
                {providerMonogram(scholarship.provider)}
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                {scholarship.provider}
              </span>
            </div>
            <h3
              className="line-clamp-2 text-ink-indigo"
              style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
            >
              {scholarship.title}
            </h3>
            <p className="text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
              {scholarship.studyLevels.map((level) => STUDY_LEVEL_LABELS[level]).join('/')} · {scholarship.hostCountry}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-8 border-t border-border-faint pt-12">
              <FundingBadge level={scholarship.fundingLevel} />
              <DeadlineBadge deadlineAt={scholarship.deadlineAt} status={scholarship.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-32 flex justify-center">
        <Button type="button" variant="secondary" size="lg" onClick={() => setIsModalOpen(true)}>
          Load more
        </Button>
      </div>

      <ScholarshipAuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
