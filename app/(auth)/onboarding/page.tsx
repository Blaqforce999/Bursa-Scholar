import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { OnboardingForm } from '@/app/(auth)/onboarding/_components/OnboardingForm';

export default async function OnboardingPage() {
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (user.onboardedAt) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-[560px] px-16 py-48 sm:px-24 sm:py-64">
      <h1
        className="text-center text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Tell us a little about you
      </h1>
      <p className="mt-8 text-center text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        Tell us a few details to personalize your scholarship matches. This never guarantees
        acceptance, and you can skip it anytime.
      </p>
      <Card className="mt-24">
        <OnboardingForm />
      </Card>
    </div>
  );
}
