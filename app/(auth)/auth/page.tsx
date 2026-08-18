import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { AuthForm } from '@/components/shared/AuthForm';

type PageProps = {
  searchParams: Promise<{ mode?: string; next?: string }>;
};

const COPY = {
  login: {
    heading: 'Welcome back',
    subheading: 'Sign in to access your scholarships and saved opportunities.',
    toggleLabel: 'New to Bursa?',
    toggleLinkLabel: 'Create an account',
  },
  signup: {
    heading: 'Create your Bursa account',
    subheading: 'Save scholarships and keep track of opportunities.',
    toggleLabel: 'Already have an account?',
    toggleLinkLabel: 'Log in',
  },
} as const;

export default async function AuthPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = params.mode === 'signup' ? 'signup' : 'login';
  const next = params.next;

  const user = await getSession();
  if (user) redirect(next || (user.onboardedAt ? '/dashboard' : '/onboarding'));

  const copy = COPY[mode];
  const otherMode = mode === 'login' ? 'signup' : 'login';
  const toggleParams = new URLSearchParams({ mode: otherMode, ...(next ? { next } : {}) });

  return (
    <div className="mx-auto max-w-[560px] px-16 py-48 sm:px-24 sm:py-64">
      <h1
        className="text-center text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        {copy.heading}
      </h1>
      <p className="mt-8 text-center text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        {copy.subheading}
      </p>
      <Card className="mt-24">
        <AuthForm mode={mode} next={next} />
      </Card>
      <p className="mt-16 text-center text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
        {copy.toggleLabel}{' '}
        <Link
          href={`/auth?${toggleParams.toString()}`}
          className="text-ink-indigo underline transition-colors hover:text-ink-indigo-dark"
        >
          {copy.toggleLinkLabel}
        </Link>
      </p>
    </div>
  );
}
