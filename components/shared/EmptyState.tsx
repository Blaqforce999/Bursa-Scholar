import type { ReactNode } from 'react';

type EmptyStateProps = {
  // required props first
  title: string;
  body: string;
  // optional props after
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-12 rounded-2xl border border-border bg-surface-white px-24 py-48 text-center">
      <h3
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
      >
        {title}
      </h3>
      <p className="max-w-[400px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        {body}
      </p>
      {action}
    </div>
  );
}
