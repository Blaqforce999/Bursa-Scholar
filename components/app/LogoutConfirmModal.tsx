'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/shared/Modal';

type LogoutConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Self-contained: owns the actual logout request and redirect, so any
 * logout trigger (desktop avatar menu, mobile drawer, the admin layout's
 * standalone LogoutButton) can drop this in with just isOpen/onClose,
 * no wiring of the logout logic itself needed at each call site.
 */
export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Log out of Bursa">
      <div className="flex flex-col items-center pt-8 text-center md:pt-0">
        <h2
          className="text-ink-indigo"
          style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
        >
          Log out of Bursa?
        </h2>
        <p className="mt-8 max-w-[320px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
          You&rsquo;ll need to sign in again.
        </p>

        <div className="mt-24 flex w-full flex-col gap-8">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Logging out…' : 'Log out'}
          </Button>
          <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
