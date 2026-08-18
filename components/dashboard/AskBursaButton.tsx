'use client';

import { useAssistant } from '@/components/app/AssistantProvider';
import { SparkIcon } from '@/components/shared/icons';

export function AskBursaButton() {
  const { open } = useAssistant();

  return (
    <button
      type="button"
      onClick={open}
      className="flex h-44 shrink-0 items-center gap-8 rounded-full bg-ink-indigo px-20 text-inverse transition hover:bg-ink-indigo-light"
      style={{ font: 'var(--font-button-label)' }}
    >
      <SparkIcon className="h-16 w-16 text-marigold" />
      Ask Bursa
    </button>
  );
}
