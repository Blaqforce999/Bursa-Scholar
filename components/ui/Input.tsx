import { cn } from '@/lib/cn';
import { ValidationIcon, type FieldState } from '@/components/ui/ValidationIcon';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  // required props first
  label: string;
  // optional props after
  hint?: string;
  error?: string;
  /** Defaults to 'error' when `error` is set, otherwise 'neutral'. Pass
   *  'success' once a field has been validated and is confirmed good. */
  state?: FieldState;
  className?: string;
};

export function Input({ label, hint, error, state, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  const resolvedState: FieldState = state ?? (error ? 'error' : 'neutral');

  return (
    <div className="flex flex-col gap-6">
      <label htmlFor={inputId} className="text-ink-indigo" style={{ font: 'var(--font-button-label)' }}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-44 w-full rounded-xl border border-border bg-surface-white py-0 pl-16 pr-40 text-ink-indigo transition-colors',
            'hover:border-border-firm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
            'disabled:cursor-not-allowed disabled:border-border-faint disabled:bg-surface-warm-light disabled:text-ink-muted disabled:hover:border-border-faint',
            resolvedState === 'error' && 'border-danger hover:border-danger',
            className
          )}
          style={{ font: 'var(--font-body-regular)' }}
          {...props}
        />
        <div className="absolute right-8">
          <ValidationIcon state={resolvedState} />
        </div>
      </div>
      {hint && !error && (
        <span id={`${inputId}-hint`} className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} role="alert" aria-live="polite" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
