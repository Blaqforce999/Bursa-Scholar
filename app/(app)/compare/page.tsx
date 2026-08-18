import { getCompareIds } from '@/lib/compare';
import { db } from '@/lib/db';
import { EmptyState } from '@/components/shared/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CompareTable } from '@/components/scholarship/CompareTable';

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
            body="Select “Add to compare” on any scholarship card or detail page (up to 4 at a time)."
            action={
              <ButtonLink href="/scholarships" variant="secondary">
                Find scholarships
              </ButtonLink>
            }
          />
        ) : (
          <CompareTable ordered={ordered} />
        )}
      </div>
    </div>
  );
}
