'use client';

import { FAQAccordion } from '@/components/shared/FAQAccordion';
import { DASHBOARD_FAQ_ITEMS } from '@/lib/faq';
import { Modal } from '@/components/shared/Modal';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Help and FAQ" className="md:max-w-[560px]">
      <h2
        className="pr-32 text-ink-indigo"
        style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
      >
        Help &amp; FAQ
      </h2>
      <div className="mt-16">
        <FAQAccordion items={DASHBOARD_FAQ_ITEMS} />
      </div>
    </Modal>
  );
}
