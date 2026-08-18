import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCompareIds } from '@/lib/compare';
import { getEligibility } from '@/lib/eligibility';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';

export default async function SavedPage() {
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (!user.onboardedAt) redirect('/onboarding');

  const [saved, compareIds] = await Promise.all([
    db.savedScholarship.findMany({
      where: { userId: user.id },
      include: { scholarship: true },
      orderBy: { createdAt: 'desc' },
    }),
    getCompareIds(),
  ]);

  const profile = { nationality: user.nationality, studyLevel: user.studyLevel, fieldOfStudy: user.fieldOfStudy };

  return (
    <div>
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Saved scholarships
      </h1>
      <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        {saved.length} saved.
      </p>

      <div className="mt-24">
        {saved.length === 0 ? (
          <EmptyState
            title="No saved scholarships yet"
            body="Save scholarships while browsing so you can come back and compare them later."
            action={
              <ButtonLink href="/scholarships" variant="secondary">
                Find scholarships
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map(({ scholarship }) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                isLoggedIn
                isSaved
                isComparing={compareIds.includes(scholarship.id)}
                eligibility={getEligibility(profile, scholarship)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
