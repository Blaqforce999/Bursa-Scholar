'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIconCmp } from '@/components/shared/icons';

export type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
  className?: string;
};

/**
 * A plain, dependency-free expand/collapse list — used for both the
 * dashboard help panel and the landing page's FAQ section, so the two
 * never drift into different interaction patterns.
 */
export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn('flex flex-col divide-y divide-border-faint', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="py-12 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-16 text-left text-ink-indigo"
              style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
            >
              {item.question}
              <ChevronDownIconCmp
                className={cn('h-18 w-18 shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && (
              <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
