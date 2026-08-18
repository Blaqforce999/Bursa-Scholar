import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

const EXPLORE_LINKS = [
  { href: '/scholarships', label: 'Find scholarships' },
  { href: '#how-it-works', label: 'How it works' },
];

const ACCOUNT_LINKS = [
  { href: '/auth?mode=login', label: 'Log in' },
  { href: '/auth?mode=signup', label: 'Sign up' },
];

export function MarketingFooter() {
  return (
    <footer style={{ background: 'var(--gradient-slate-subtle)' }}>
      <RevealOnScroll className="mx-auto grid max-w-[1200px] gap-32 px-16 py-48 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-64 sm:px-24 lg:py-64">
        <Logo />

        <div className="flex flex-col gap-12">
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}>
            EXPLORE
          </p>
          {EXPLORE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-indigo hover:text-ink-indigo-light"
              style={{ font: 'var(--font-body-small)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-12">
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}>
            ACCOUNT
          </p>
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-indigo hover:text-ink-indigo-light"
              style={{ font: 'var(--font-body-small)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-12 sm:max-w-[220px]">
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}>
            WHO WE ARE
          </p>
          <p className="text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
            Helping African students find scholarships worth applying for.
          </p>
        </div>
      </RevealOnScroll>

      <div className="border-t border-border-faint">
        <div className="mx-auto max-w-[1200px] px-16 py-24 sm:px-24">
          <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
            © {new Date().getFullYear()} Bursa · Bursa helps students discover scholarship
            opportunities. Applications are completed through each provider&apos;s official
            website.
          </p>
        </div>
      </div>
    </footer>
  );
}
