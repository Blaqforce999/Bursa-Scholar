import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { ProfileForm } from '@/app/(app)/profile/_components/ProfileForm';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (!user.onboardedAt) redirect('/onboarding');

  return (
    <div className="max-w-[520px]">
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Your profile
      </h1>
      <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
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
    </div>
  );
}
