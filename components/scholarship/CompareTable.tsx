'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CompareButton } from '@/components/scholarship/CompareButton';
import { cn } from '@/lib/cn';
import type { db } from '@/lib/db';

type CompareRow = {
  label: string;
  render: (s: Awaited<ReturnType<typeof db.scholarship.findMany>>[number]) => React.ReactNode;
};

type CompareTableProps = {
  ordered: Awaited<ReturnType<typeof db.scholarship.findMany>>;
  rows: CompareRow[];
};

/**
 * Extracted from the compare page (a Server Component) only because the
 * first-view swipe hint needs client state to fade away after the visitor's
 * first scroll — everything else here could stay server-rendered.
 */
export function CompareTable({ ordered, rows }: CompareTableProps) {
  const [showHint, setShowHint] = useState(true);

  return (
    <div className="relative">
      <div
        onScroll={() => setShowHint(false)}
        className="overflow-x-auto [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain]"
      >
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 w-[140px]"
                style={{ backgroundColor: 'var(--color-surface-warm-off-white)' }}
              ></th>
              {ordered.map((scholarship) => (
                <th
                  key={scholarship.id}
                  className="border-b border-border p-12 text-left align-top"
                  style={{ backgroundColor: 'var(--color-surface-warm-off-white)' }}
                >
                  <Link href={`/scholarships/${scholarship.slug}`} className="text-ink-indigo hover:underline">
                    <span className="line-clamp-2" style={{ font: 'var(--font-heading-h4)' }}>
                      {scholarship.title}
                    </span>
                  </Link>
                  <p className="mt-4 text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                    {scholarship.provider}
                  </p>
                  <div className="mt-8">
                    <CompareButton scholarshipId={scholarship.id} initialSelected />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th
                  className="sticky left-0 z-10 border-b border-border-faint p-12 text-left align-top text-ink-muted"
                  style={{ font: 'var(--font-body-small)', backgroundColor: 'var(--color-surface-warm-off-white)' }}
                >
                  {row.label}
                </th>
                {ordered.map((scholarship) => (
                  <td
                    key={scholarship.id}
                    className="border-b border-border-faint p-12 align-top text-ink-indigo"
                    style={{ font: 'var(--font-body-small)' }}
                  >
                    {row.render(scholarship)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 flex w-40 items-center justify-end pr-4 transition-opacity duration-300 sm:hidden',
          showHint ? 'opacity-100' : 'opacity-0'
        )}
        style={{ background: 'linear-gradient(90deg, transparent, var(--color-surface-warm-off-white) 70%)' }}
      >
        <span className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
          ⟷
        </span>
      </div>
    </div>
  );
}
