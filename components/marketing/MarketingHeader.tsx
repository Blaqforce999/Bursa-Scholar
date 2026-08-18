import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/ButtonLink';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-faint bg-surface-white/90 backdrop-blur">
      <div className="mx-auto flex h-64 max-w-[1200px] items-center justify-between px-16 sm:px-24">
        <Logo />
        <nav className="hidden items-center gap-32 md:flex" aria-label="Primary">
          <Link
            href="/scholarships"
            className="text-ink-indigo hover:text-ink-indigo-light"
            style={{ font: 'var(--font-button-label)' }}
          >
            Find scholarships
          </Link>
          <Link
            href="#how-it-works"
            className="text-ink-indigo hover:text-ink-indigo-light"
            style={{ font: 'var(--font-button-label)' }}
          >
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-12">
          <Link
            href="/auth?mode=login"
            className="min-h-44 content-center text-ink-indigo transition hover:text-ink-indigo-light"
            style={{ font: 'var(--font-button-label)' }}
          >
            Log in
          </Link>
          <ButtonLink href="/auth?mode=signup" size="sm" className="px-16">
            Create free account
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
