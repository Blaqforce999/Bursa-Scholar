import Link from 'next/link';
import { getCompareIds } from '@/lib/compare';
import { db } from '@/lib/db';
import { EmptyState } from '@/components/shared/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CompareButton } from '@/components/scholarship/CompareButton';
import { FundingBadge } from '@/components/scholarship/FundingBadge';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { STUDY_LEVEL_LABELS } from '@/lib/constants';

const ROWS: Array<{ label: string; render: (s: Awaited<ReturnType<typeof db.scholarship.findMany>>[number]) => React.ReactNode }> = [
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

export default async function ComparePage() {
  const ids = await getCompareIds();
  const scholarships = ids.length
    ? await db.scholarship.findMany({ where: { id: { in: ids } } })
    : [];
  // Preserve selection order rather than the DB's natural order.
  const ordered = ids.map((id) => scholarships.find((s) => s.id === id)).filter((s) => s !== undefined);

  return (
    <div>
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Compare scholarships
      </h1>
      <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        {ordered.length} of 4 selected.
      </p>

      <div className="mt-24">
        {ordered.length < 2 ? (
          <EmptyState
            title="Add at least 2 scholarships to compare"
            body='Select "Add to compare" on any scholarship card or detail page — up to 4 at a time.'
            action={
              <ButtonLink href="/scholarships" variant="secondary">
                Find scholarships
              </ButtonLink>
            }
          />
        ) : (
          <div className="overflow-x-auto">
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
        )}
      </div>
    </div>
  );
}
