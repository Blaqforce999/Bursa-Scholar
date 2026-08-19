'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/shared/Modal';
import { deleteAccount } from '@/app/(app)/profile/actions';

type DeleteAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsSubmitting(true);
    setError(null);

    const result = await deleteAccount();
    if (!result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Delete your account">
      <div className="flex flex-col items-center pt-8 text-center md:pt-0">
        <h2
          className="text-danger"
          style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
        >
          Delete your account?
        </h2>
        <p className="mt-8 max-w-[320px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
          This permanently deletes your account, saved scholarships, and profile. This cannot be undone.
        </p>

        {error && (
          <p role="alert" className="mt-16 text-danger" style={{ font: 'var(--font-body-small)' }}>
            {error}
          </p>
        )}

        <div className="mt-24 flex w-full flex-col gap-8">
          <Button
            type="button"
            variant="danger"
            size="lg"
            className="w-full"
            onClick={handleDelete}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Deleting…' : 'Delete my account'}
          </Button>
          <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
