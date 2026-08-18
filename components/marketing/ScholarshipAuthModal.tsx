'use client';

import Link from 'next/link';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Modal } from '@/components/shared/Modal';

type ScholarshipAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * The gate anonymous visitors hit when they try to see more than the
 * initial public preview, on the landing page's Load More and anywhere
 * else that needs the same "sign up to go further" prompt. Never a dead
 * end: closing it always returns to the same public results.
 */
export function ScholarshipAuthModal({ isOpen, onClose }: ScholarshipAuthModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create a free account">
      <div className="flex flex-col items-center pt-8 text-center md:pt-0">
        <h2
          className="text-ink-indigo"
          style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
        >
          Create a free account to see more
        </h2>
        <p className="mt-8 max-w-[320px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
          Sign up to unlock every scholarship, your personalized matches, saving, and comparison. Free, always.
        </p>
        <ButtonLink href="/auth?mode=signup" size="lg" className="mt-24 w-full">
          Create free account
        </ButtonLink>
        <Link
          href="/auth?mode=login"
          onClick={onClose}
          className="mt-16 text-ink-muted underline transition hover:text-ink-indigo"
          style={{ font: 'var(--font-body-small)' }}
        >
          Log in
        </Link>
      </div>
    </Modal>
  );
}
