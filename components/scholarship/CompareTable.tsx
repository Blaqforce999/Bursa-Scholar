'use client';

import Link from 'next/link';
import { providerMonogram } from '@/lib/format';
import { STUDY_LEVEL_LABELS } from '@/lib/constants';
import { CompareButton } from '@/components/scholarship/CompareButton';
import { FundingBadge } from '@/components/scholarship/FundingBadge';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import type { Scholarship } from '@prisma/client';

type CompareRow = {
  label: string;
  render: (s: Scholarship) => React.ReactNode;
};

const ROWS: CompareRow[] = [
  { label: 'Funding', render: (s) => <FundingBadge level={s.fundingLevel} /> },
  { label: 'Study level', render: (s) => s.studyLevels.map((l) => STUDY_LEVEL_LABELS[l]).join(', ') },
  { label: 'Host country', render: (s) => `${s.hostCountry} (${s.region})` },
  { label: 'Field of study', render: (s) => s.fieldsOfStudy.join(', ') },
  {
    label: 'Eligible nationalities',
    render: (s) => (s.openToAllAfrican ? 'Open to all African nationalities' : s.eligibleNationalities.join(', ')),
  },
  { label: 'Deadline', render: (s) => <DeadlineBadge deadlineAt={s.deadlineAt} status={s.status} /> },
  { label: 'Requirements', render: (s) => s.requirements },
];

type CompareTableProps = {
  ordered: Scholarship[];
};

/**
 * Row-render logic lives here (a Client Component), not in the Server
 * Component page that fetches the data — passing functions like these as
 * props across the server/client boundary throws at runtime ("Functions
 * cannot be passed directly to Client Components"), which is what was
 * crashing this page. The page now only ever passes plain scholarship data.
 *
 * Mobile renders a compact stacked card per scholarship (label above value,
 * no horizontal scroll); md+ keeps a side-by-side comparison table.
 */
export function CompareTable({ ordered }: CompareTableProps) {
  return (
    <>
      <div className="flex flex-col gap-16 md:hidden">
        {ordered.map((scholarship) => (
          <div key={scholarship.id} className="rounded-2xl border border-border bg-surface-white p-20">
            <div className="flex items-center gap-8">
              <span
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-ink-indigo/10 text-ink-indigo"
                style={{ font: 'var(--font-caption)' }}
              >
                {providerMonogram(scholarship.provider)}
              </span>
              <Link
                href={`/scholarships/${scholarship.slug}`}
                className="min-w-0 flex-1 text-ink-indigo hover:underline"
              >
                <span className="line-clamp-2" style={{ font: 'var(--font-heading-h4)' }}>
                  {scholarship.title}
                </span>
              </Link>
            </div>
            <div className="mt-12">
              <CompareButton scholarshipId={scholarship.id} initialSelected />
            </div>

            <dl className="mt-16 flex flex-col gap-12 border-t border-border-faint pt-16">
              {ROWS.map((row) => (
                <div key={row.label} className="flex flex-col gap-2">
                  <dt className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
                    {row.label}
                  </dt>
                  <dd className="text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                    {row.render(scholarship)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="w-[140px]"></th>
              {ordered.map((scholarship) => (
                <th key={scholarship.id} className="border-b border-border p-12 text-left align-top">
                  <Link href={`/scholarships/${scholarship.slug}`} className="text-ink-indigo hover:underline">
                    <span style={{ font: 'var(--font-heading-h4)' }}>{scholarship.title}</span>
                  </Link>
                  <p className="mt-4 text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                    {scholarship.provider}
                  </p>
                  <div className="mt-8">
                    <CompareButton scholarshipId={scholarship.id} initialSelected />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th
                  className="border-b border-border-faint p-12 text-left align-top text-ink-muted"
                  style={{ font: 'var(--font-body-small)' }}
                >
                  {row.label}
                </th>
                {ordered.map((scholarship) => (
                  <td
                    key={scholarship.id}
                    className="border-b border-border-faint p-12 align-top text-ink-indigo"
                    style={{ font: 'var(--font-body-small)' }}
                  >
                    {row.render(scholarship)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
