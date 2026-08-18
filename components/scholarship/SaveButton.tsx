'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveScholarship, unsaveScholarship } from '@/app/(app)/scholarships/actions';
import { cn } from '@/lib/cn';
import { BookmarkIcon } from '@/components/shared/icons';

type SaveButtonProps = {
  // required props first
  scholarshipId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  // optional props after
  className?: string;
};

export function SaveButton({ scholarshipId, initialSaved, isLoggedIn, className }: SaveButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

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
        'inline-flex h-44 w-44 items-center justify-center rounded-full border transition',
        saved ? 'border-marigold bg-marigold-light text-marigold-dark' : 'border-border bg-surface-white text-ink-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
        className
      )}
    >
      <BookmarkIcon filled={saved} className="h-20 w-20" />
    </button>
  );
}
