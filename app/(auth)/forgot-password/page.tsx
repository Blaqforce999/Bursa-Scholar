import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { Card } from '@/components/ui/Card';
import { ForgotPasswordForm } from '@/app/(auth)/forgot-password/_components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  // Dormant while EMAIL_VERIFICATION_ENABLED is off: the link that leads
  // here is already hidden on login, this is the same gate applied to
  // direct navigation, so the page never exists in a reachable state
  // without email actually working.
  if (!env.EMAIL_VERIFICATION_ENABLED) redirect('/auth?mode=login');

  return (
    <div className="mx-auto max-w-[560px] px-16 py-48 sm:px-24 sm:py-64">
      <h1
        className="text-center text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Reset your password
      </h1>
      <p className="mt-8 text-center text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        Enter your email and we&rsquo;ll send you a link to reset your password.
      </p>
      <Card className="mt-24">
        <ForgotPasswordForm />
      </Card>
    </div>
  );
}
