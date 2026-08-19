import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { ProfileForm } from '@/app/(app)/profile/_components/ProfileForm';
import { ChangePasswordForm } from '@/app/(app)/profile/_components/ChangePasswordForm';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (!user.onboardedAt) redirect('/onboarding');

  // Bursa doesn't have photo upload set up yet (no storage configured, no
  // avatarUrl field on User) — an initials avatar works today with no
  // upload, no storage, and nothing to migrate. Real photo upload is a
  // separate, later addition once Vercel Blob is actually wired up.
  const initials =
    (user.name ?? 'You')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'Y';

  return (
    <div className="max-w-[520px]">
      <div className="flex items-center gap-16">
        <span
          aria-hidden="true"
          className="flex h-72 w-72 shrink-0 items-center justify-center rounded-full bg-marigold text-ink-indigo"
          style={{ font: 'var(--font-heading-h3)' }}
        >
          {initials}
        </span>
        <div>
          <h1
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
          >
            Your profile
          </h1>
          {user.name && (
            <p className="mt-4 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
              {user.name}
            </p>
          )}
        </div>
      </div>
      <p className="mt-16 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        This powers your eligibility labels. It never guarantees acceptance, and updating it takes
        effect on your next search.
      </p>
      <Card className="mt-24">
        <ProfileForm
          initial={{
            nationality: user.nationality,
            studyLevel: user.studyLevel,
            fieldOfStudy: user.fieldOfStudy,
            targetRegion: user.targetRegion,
          }}
        />
      </Card>

      <h2
        className="mt-40 text-ink-indigo"
        style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
      >
        Change password
      </h2>
      <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        Requires your current password. Your other signed-in devices will be logged out.
      </p>
      <Card className="mt-24">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
