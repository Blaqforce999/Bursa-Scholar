'use client';

import { useState } from 'react';
import { saveScholarship, unsaveScholarship } from '@/app/(app)/scholarships/actions';
import { cn } from '@/lib/cn';
import { BookmarkIcon } from '@/components/shared/icons';

type DashboardSaveButtonProps = {
  // required props first
  scholarshipId: string;
  initialSaved: boolean;
  // optional props after
  className?: string;
};

/**
 * The clean card's hover-reveal save control. Reuses the same
 * save/unsave server actions as the main SaveButton, just with its own
 * visual treatment (icon-only, revealed on hover, marigold-on-ink when
 * saved) and click handling that keeps the card's own stretched-link
 * from also firing a navigation.
 */
export function DashboardSaveButton({ scholarshipId, initialSaved, className }: DashboardSaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    const result = saved ? await unsaveScholarship(scholarshipId) : await saveScholarship(scholarshipId);
    if (result.ok) setSaved(result.data.saved);
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved scholarships' : 'Save scholarship'}
      className={cn(
        'flex h-32 w-32 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
        // Hover-reveal only makes sense on a mouse-driven desktop layout —
        // a touch device has no hover, so the control stays visible below
        // the lg breakpoint rather than becoming undiscoverable.
        saved
          ? 'bg-ink-indigo text-marigold opacity-100'
          : 'bg-surface-white text-ink-muted opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100',
        className
      )}
    >
      <BookmarkIcon filled={saved} className="h-16 w-16" />
    </button>
  );
}
