'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CloseIcon } from '@/components/shared/icons';

type ScholarshipAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * The gate anonymous visitors hit when they try to see more than the
 * initial public preview — on the landing page's Load More, and anywhere
 * else that needs the same "sign up to go further" prompt. Never a dead
 * end: closing it always returns to the same public results.
 */
const noopSubscribe = () => () => {};

/** Renders true only once React has committed on the client — the portal
 *  target (`document.body`) doesn't exist during server rendering. */
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function ScholarshipAuthModal({ isOpen, onClose }: ScholarshipAuthModalProps) {
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  // Portalled to <body> so this always positions against the true
  // viewport — a `fixed` element nested inside an animated ancestor (e.g.
  // RevealOnScroll's settled `transform: translateY(0)`) would otherwise
  // be contained by that ancestor instead of the viewport.
  return createPortal(
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-ink-indigo/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scholarship-auth-modal-heading"
        className="fixed inset-0 z-50 flex items-center justify-center p-16"
      >
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface-white p-24 shadow-lg">
          <div className="flex items-start justify-between gap-12">
            <h2
              id="scholarship-auth-modal-heading"
              className="text-ink-indigo"
              style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
            >
              Create a free account to see more
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo"
            >
              <CloseIcon className="h-18 w-18" />
            </button>
          </div>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            Sign up to unlock every scholarship, your personalized matches, saving, and comparison — free, always.
          </p>
          <div className="mt-24 flex flex-col gap-8 sm:flex-row">
            <ButtonLink href="/auth?mode=signup" size="lg" className="flex-1">
              Create free account
            </ButtonLink>
            <Button type="button" variant="ghost" size="lg" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
          <p className="mt-16 text-center text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
            Already have an account?{' '}
            <Link href="/auth?mode=login" className="text-ink-indigo underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
