import Link from 'next/link';
import { CloseIcon } from '@/components/shared/icons';

type FilterChipProps = {
  // required props first
  label: string;
  removeHref: string;
};

export function FilterChip({ label, removeHref }: FilterChipProps) {
  return (
    <Link
      href={removeHref}
      className="inline-flex items-center gap-6 rounded-full bg-ink-indigo px-12 py-6 text-inverse hover:bg-ink-indigo-light"
      style={{ font: 'var(--font-caption)' }}
      aria-label={`Remove filter: ${label}`}
    >
      {label}
      <CloseIcon className="h-12 w-12" aria-hidden="true" />
    </Link>
  );
}
