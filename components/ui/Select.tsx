import { cn } from '@/lib/cn';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  // required props first
  label: string;
  // optional props after
  hint?: string;
  className?: string;
};

export function Select({ label, hint, className, id, name, children, ...props }: SelectProps) {
  const selectId = id ?? name;

  return (
    <div className="flex flex-col gap-6">
      <label htmlFor={selectId} className="text-ink-indigo" style={{ font: 'var(--font-button-label)' }}>
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        aria-describedby={hint ? `${selectId}-hint` : undefined}
        className={cn(
          'h-44 rounded-xl border border-border bg-surface-white px-16 text-ink-indigo',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
          className
        )}
        style={{ font: 'var(--font-body-regular)' }}
        {...props}
      >
        {children}
      </select>
      {hint && (
        <span id={`${selectId}-hint`} className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}
