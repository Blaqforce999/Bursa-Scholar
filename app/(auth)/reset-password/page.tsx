import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { Card } from '@/components/ui/Card';
import { ResetPasswordForm } from '@/app/(auth)/reset-password/_components/ResetPasswordForm';

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  if (!env.EMAIL_VERIFICATION_ENABLED) redirect('/auth?mode=login');

  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-[560px] px-16 py-48 sm:px-24 sm:py-64">
      <h1
        className="text-center text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Choose a new password
      </h1>
      <Card className="mt-24">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p role="alert" className="text-danger" style={{ font: 'var(--font-body-regular)' }}>
            This reset link is missing or invalid. Request a new one from the login screen.
          </p>
        )}
      </Card>
    </div>
  );
}
