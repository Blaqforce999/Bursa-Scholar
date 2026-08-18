'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';

type SegmentedControlProps<T extends string> = {
  // required props first
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  // optional props after
  'aria-label'?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = options.findIndex((option) => option.value === value);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
    onChange(options[nextIndex].value);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="relative inline-flex rounded-full border border-border bg-surface-warm-light p-2"
    >
      <div
        aria-hidden="true"
        className="segmented-thumb absolute inset-y-2 rounded-full bg-ink-indigo"
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={cn(
            'relative z-10 rounded-full px-16 py-8 transition-colors',
            value === option.value ? 'text-inverse' : 'text-ink-indigo'
          )}
          style={{ font: 'var(--font-button-label)', transitionDuration: 'var(--dur-fast)' }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
