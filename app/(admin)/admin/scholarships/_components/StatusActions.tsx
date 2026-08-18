'use client';

import { useState, useTransition } from 'react';
import { setScholarshipStatus, verifyScholarship } from '@/app/(admin)/admin/scholarships/actions';
import type { ScholarshipStatus } from '@prisma/client';

type StatusActionsProps = {
  // required props first
  scholarshipId: string;
  status: ScholarshipStatus;
  verifiedAt: Date | null;
};

export function StatusActions({ scholarshipId, status, verifiedAt }: StatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(next: ScholarshipStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setScholarshipStatus(scholarshipId, next);
      if (!result.ok) setError(result.error.message);
    });
  }

  function handleVerify() {
    setError(null);
    startTransition(async () => {
      const result = await verifyScholarship(scholarshipId);
      if (!result.ok) setError(result.error.message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-8">
        {status !== 'PUBLISHED' && (
          <button
            type="button"
            onClick={() => changeStatus('PUBLISHED')}
            disabled={isPending}
            className="text-eligible underline"
            style={{ font: 'var(--font-caption)' }}
          >
            Publish
          </button>
        )}
        {status !== 'CLOSED' && (
          <button
            type="button"
            onClick={() => changeStatus('CLOSED')}
            disabled={isPending}
            className="text-ink-muted underline"
            style={{ font: 'var(--font-caption)' }}
          >
            Mark closed
          </button>
        )}
        {status !== 'ARCHIVED' && (
          <button
            type="button"
            onClick={() => changeStatus('ARCHIVED')}
            disabled={isPending}
            className="text-danger underline"
            style={{ font: 'var(--font-caption)' }}
          >
            Archive
          </button>
        )}
        {!verifiedAt && (
          <button
            type="button"
            onClick={handleVerify}
            disabled={isPending}
            className="text-ink-indigo underline"
            style={{ font: 'var(--font-caption)' }}
          >
            Mark verified
          </button>
        )}
      </div>
      {error && (
        <span className="text-danger" style={{ font: 'var(--font-caption)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
