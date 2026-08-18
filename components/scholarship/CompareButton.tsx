'use client';

import { useState } from 'react';
import { toggleCompare } from '@/app/(app)/scholarships/actions';
import { cn } from '@/lib/cn';

type CompareButtonProps = {
  // required props first
  scholarshipId: string;
  initialSelected: boolean;
  // optional props after
  className?: string;
};

export function CompareButton({ scholarshipId, initialSelected, className }: CompareButtonProps) {
  const [selected, setSelected] = useState(initialSelected);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    setError(null);
    const result = await toggleCompare(scholarshipId, selected);
    if (result.ok) {
      setSelected(result.ids.includes(scholarshipId));
    } else {
      setError(result.error.message);
    }
    setIsPending(false);
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={selected}
        className={cn(
          'inline-flex h-36 items-center gap-6 rounded-full border px-12',
          selected ? 'border-ink-indigo bg-ink-indigo text-inverse' : 'border-border bg-surface-white text-ink-indigo',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
          className
        )}
        style={{ font: 'var(--font-button-label)' }}
      >
        {selected ? 'Added to compare' : 'Add to compare'}
      </button>
      {error && (
        <span className="text-danger" style={{ font: 'var(--font-caption)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
