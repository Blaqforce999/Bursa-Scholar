'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { FAQAccordion } from '@/components/shared/FAQAccordion';
import { DASHBOARD_FAQ_ITEMS } from '@/lib/faq';
import { CloseIcon } from '@/components/shared/icons';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const noopSubscribe = () => () => {};

/** Renders true only once mounted on the client — the portal target
 *  (`document.body`) doesn't exist during server rendering. */
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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

  return createPortal(
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-ink-indigo/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-heading"
        className="fixed inset-0 z-50 flex items-center justify-center p-16"
      >
        <div className="flex max-h-[80vh] w-full max-w-[560px] flex-col rounded-2xl border border-border bg-surface-white shadow-lg">
          <div className="flex items-center justify-between gap-12 border-b border-border-faint p-20">
            <h2
              id="help-modal-heading"
              className="text-ink-indigo"
              style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
            >
              Help &amp; FAQ
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close help"
              className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo"
            >
              <CloseIcon className="h-18 w-18" />
            </button>
          </div>
          <div className="overflow-y-auto p-20">
            <FAQAccordion items={DASHBOARD_FAQ_ITEMS} />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
