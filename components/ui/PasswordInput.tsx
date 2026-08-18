'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ValidationIcon, type FieldState } from '@/components/ui/ValidationIcon';
import { EyeOpenIcon, EyeClosedIcon } from '@/components/shared/icons';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  // required props first
  label: string;
  // optional props after
  hint?: string;
  error?: string;
  state?: FieldState;
  className?: string;
};

export function PasswordInput({ label, hint, error, state, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
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
          type={visible ? 'text' : 'password'}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-44 w-full rounded-xl border border-border bg-surface-white py-0 pl-16 pr-72 text-ink-indigo transition-colors',
            'hover:border-border-firm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
            'disabled:cursor-not-allowed disabled:border-border-faint disabled:bg-surface-warm-light disabled:text-ink-muted disabled:hover:border-border-faint',
            resolvedState === 'error' && 'border-danger hover:border-danger',
            className
          )}
          style={{ font: 'var(--font-body-regular)' }}
          {...props}
        />
        <div className="absolute right-8 flex items-center gap-4">
          <ValidationIcon state={resolvedState} />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="flex h-20 w-20 shrink-0 items-center justify-center text-ink-muted transition hover:text-ink-indigo"
          >
            {visible ? <EyeClosedIcon className="h-16 w-16" /> : <EyeOpenIcon className="h-16 w-16" />}
          </button>
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
