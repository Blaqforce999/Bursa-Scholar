import { SuccessIcon, ErrorIcon } from '@/components/shared/icons';

export type FieldState = 'neutral' | 'error' | 'success';

/**
 * Fixed-width reserved slot so its appearance/disappearance never shifts
 * layout. Success/error swap via conditional render, which remounts the
 * icon and re-triggers its `animate-icon-pop` spring pop naturally.
 */
export function ValidationIcon({ state }: { state: FieldState }) {
  return (
    <span className="flex h-20 w-20 shrink-0 items-center justify-center" aria-hidden="true">
      {state === 'success' && <SuccessIcon className="animate-icon-pop h-16 w-16 text-eligible" />}
      {state === 'error' && <ErrorIcon className="animate-icon-pop h-16 w-16 text-danger" />}
    </span>
  );
}
