'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center gap-16 px-16 py-64 text-center">
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
      >
        Something went wrong.
      </h1>
      <p className="text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        Please try again later. If this keeps happening, come back in a little while. Nothing you did
        caused this.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
