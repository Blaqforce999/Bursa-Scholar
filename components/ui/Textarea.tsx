import { cn } from '@/lib/cn';
import { ValidationIcon, type FieldState } from '@/components/ui/ValidationIcon';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // required props first
  label: string;
  // optional props after
  hint?: string;
  error?: string;
  state?: FieldState;
  className?: string;
};

/**
 * Same field API as Input, but the validation icon sits beside the label
 * instead of overlapping the textarea — a trailing in-field icon would
 * sit awkwardly over multi-line typed text.
 */
export function Textarea({ label, hint, error, state, className, id, rows = 3, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;
  const resolvedState: FieldState = state ?? (error ? 'error' : 'neutral');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <label htmlFor={textareaId} className="text-ink-indigo" style={{ font: 'var(--font-button-label)' }}>
          {label}
        </label>
        <ValidationIcon state={resolvedState} />
      </div>
      <textarea
        id={textareaId}
        rows={rows}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          'rounded-xl border border-border bg-surface-white p-16 text-ink-indigo transition-colors',
          'hover:border-border-firm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
          'disabled:cursor-not-allowed disabled:border-border-faint disabled:bg-surface-warm-light disabled:text-ink-muted disabled:hover:border-border-faint',
          resolvedState === 'error' && 'border-danger hover:border-danger',
          className
        )}
        style={{ font: 'var(--font-body-regular)' }}
        {...props}
      />
      {hint && !error && (
        <span id={`${textareaId}-hint`} className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${textareaId}-error`} role="alert" aria-live="polite" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
