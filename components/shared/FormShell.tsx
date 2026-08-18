'use client';

import { Children, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronUpIconCmp, ChevronDownIconCmp } from '@/components/shared/icons';

/**
 * Shared motion + interaction layer for every form field list in the app:
 * staggered entrance on mount, single-field focus emphasis (the active
 * field lifts, every other field recedes), and in-field prev/next
 * navigation via small chevrons on the active row — synchronous
 * `.focus()` calls so the on-screen keyboard never dismisses between
 * fields. Enter advances to the next field on single-line inputs (never
 * intercepted inside a textarea, where Enter should insert a newline).
 *
 * Only wrap the actual field rows in `FormShell` — the submit button and
 * any form-level error banner belong outside it, as siblings within the
 * `<form>` tag, so they don't get treated as navigable/emphasized rows.
 */
type FormShellProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function FormShell({ children, className, id }: FormShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rows = Children.toArray(children);

  function rowElements() {
    return containerRef.current ? Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-form-row]')) : [];
  }

  function focusRow(index: number) {
    const target = rowElements()[index];
    target?.querySelector<HTMLElement>('input, select, textarea, button[role="tab"]')?.focus();
  }

  function handleFocus(event: React.FocusEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[data-form-row]');
    if (!row) return;
    const index = rowElements().indexOf(row);
    if (index >= 0) setActiveIndex(index);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextFocus = event.relatedTarget as Node | null;
    if (!nextFocus || !containerRef.current?.contains(nextFocus)) {
      setActiveIndex(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter') return;
    const tag = (event.target as HTMLElement).tagName;
    if (tag !== 'INPUT') return; // textareas get newlines; selects/buttons behave natively

    const row = (event.target as HTMLElement).closest<HTMLElement>('[data-form-row]');
    const all = rowElements();
    const index = row ? all.indexOf(row) : -1;
    if (index >= 0 && index < all.length - 1) {
      event.preventDefault();
      focusRow(index + 1);
    }
    // On the last row, let Enter fall through to the form's native submit.
  }

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {rows.map((child, index) => (
        <div
          key={index}
          data-form-row
          className={cn(
            'form-row animate-form-row-in relative',
            activeIndex === index && 'form-row-active',
            activeIndex !== null && activeIndex !== index && 'form-row-recede'
          )}
          style={{ animationDelay: `calc(var(--stagger-step) * ${index})` }}
        >
          {child}
          {activeIndex === index && rows.length > 1 && (
            <FieldNavChevrons
              onPrev={index > 0 ? () => focusRow(index - 1) : undefined}
              onNext={index < rows.length - 1 ? () => focusRow(index + 1) : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldNavChevrons({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  return (
    <div className="animate-icon-pop absolute right-0 top-0 flex gap-2">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Previous field"
        aria-hidden={!onPrev}
        disabled={!onPrev}
        onClick={onPrev}
        className="flex h-20 w-20 items-center justify-center rounded text-ink-muted transition hover:text-ink-indigo disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronUpIconCmp className="h-12 w-12" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Next field"
        aria-hidden={!onNext}
        disabled={!onNext}
        onClick={onNext}
        className="flex h-20 w-20 items-center justify-center rounded text-ink-muted transition hover:text-ink-indigo disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronDownIconCmp className="h-12 w-12" />
      </button>
    </div>
  );
}
