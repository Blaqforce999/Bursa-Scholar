import Link from 'next/link';
import { db } from '@/lib/db';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Badge } from '@/components/ui/Badge';
import { StatusActions } from '@/app/(admin)/admin/scholarships/_components/StatusActions';

const STATUS_TONE = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  CLOSED: 'neutral',
  ARCHIVED: 'danger',
} as const;

export default async function AdminScholarshipsPage() {
  const scholarships = await db.scholarship.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
          {scholarships.length} scholarship{scholarships.length === 1 ? '' : 's'} in the database — any
          status.
        </p>
        <ButtonLink href="/admin/scholarships/new" size="sm">
          New scholarship
        </ButtonLink>
      </div>

      <div className="mt-24 flex flex-col gap-12">
        {scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="flex flex-col gap-12 rounded-2xl border border-border bg-surface-white p-16 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-8">
                <Badge tone={STATUS_TONE[scholarship.status]}>{scholarship.status}</Badge>
                {scholarship.verifiedAt && <Badge tone="success">Verified</Badge>}
              </div>
              <Link
                href={`/admin/scholarships/${scholarship.id}/edit`}
                className="mt-4 inline-block text-ink-indigo hover:underline"
                style={{ font: 'var(--font-heading-h4)' }}
              >
                {scholarship.title}
              </Link>
              <p className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                {scholarship.provider} · {scholarship.hostCountry}
              </p>
            </div>
            <StatusActions
              scholarshipId={scholarship.id}
              status={scholarship.status}
              verifiedAt={scholarship.verifiedAt}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
