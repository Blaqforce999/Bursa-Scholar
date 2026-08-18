import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/app/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/auth?mode=login');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-[1200px] px-16 py-32 sm:px-24 lg:py-48">
      <div className="mb-24 flex items-center justify-between border-b border-border-faint pb-16">
        <div>
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
            Admin
          </p>
          <Link
            href="/admin/scholarships"
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)' }}
          >
            Scholarship curation
          </Link>
        </div>
        <div className="flex items-center gap-16">
          <Link href="/dashboard" className="text-ink-indigo underline" style={{ font: 'var(--font-body-small)' }}>
            Back to student dashboard
          </Link>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
