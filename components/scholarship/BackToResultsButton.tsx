'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BackArrowIcon } from '@/components/shared/icons';

type BackToResultsButtonProps = {
  // optional props after
  from?: string;
};

/**
 * Renders as a plain link to the exact discovery URL (search/sort/filters
 * intact from `from`), or to Discover when the page was opened directly
 * (shared link, new tab, the AI panel). On click, if there's actually
 * in-app history to return to, it intercepts and uses a true history back
 * instead, so scroll position is restored too — checked at click time
 * (not in an effect) since `window.history` only matters at the moment
 * of navigation, not on render.
 */
export function BackToResultsButton({ from }: BackToResultsButtonProps) {
  const router = useRouter();
  const label = from ? 'Back to results' : 'Browse scholarships';
  const fallbackHref = from ?? '/scholarships';

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (from && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className="inline-flex items-center gap-6 text-ink-indigo transition hover:underline"
      style={{ font: 'var(--font-button-label)' }}
    >
      <BackArrowIcon className="h-16 w-16" />
      {label}
    </Link>
  );
}
