'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIconCmp } from '@/components/shared/icons';
import type { FAQItem } from '@/components/shared/FAQAccordion';

type FAQCardsProps = {
  items: FAQItem[];
};

/**
 * The landing page's own FAQ layout: each question is its own card rather
 * than a divided list, for a calmer, more unhurried rhythm on a page
 * that's trying to earn trust before signup. Deliberately separate from
 * the shared FAQAccordion (used by the dashboard help panel) so the two
 * surfaces can evolve independently.
 */
export function FAQCards({ items }: FAQCardsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-16">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `landing-faq-panel-${index}`;

        return (
          <div
            key={item.question}
            className="rounded-2xl border border-border bg-surface-white transition-colors hover:border-border-firm"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-16 rounded-2xl p-20 text-left text-ink-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo sm:p-24"
              style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
            >
              {item.question}
              <ChevronDownIconCmp
                className={cn('h-20 w-20 shrink-0 text-ink-muted transition-transform duration-200', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && (
              <p
                id={panelId}
                className="px-20 pb-20 text-ink-muted-dark sm:px-24 sm:pb-24"
                style={{ font: 'var(--font-body-regular)' }}
              >
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
