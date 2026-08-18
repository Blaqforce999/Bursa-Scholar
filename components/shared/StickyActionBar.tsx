import { cn } from '@/lib/cn';

type StickyActionBarProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Keeps the primary submit action reachable on mobile for longer forms
 * (onboarding, profile, admin) without the user scrolling back up.
 * Desktop forms are short enough that this isn't needed there, so it
 * reverts to normal static flow at the `sm` breakpoint.
 */
export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-12 sm:flex-row',
        'max-sm:sticky max-sm:bottom-16 max-sm:z-10 max-sm:rounded-2xl max-sm:border max-sm:border-border-faint max-sm:bg-surface-white max-sm:p-12 max-sm:shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
