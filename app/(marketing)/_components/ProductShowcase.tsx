'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';
import { cn } from '@/lib/cn';

type TabKey = 'search' | 'eligibility' | 'compare';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'search', label: 'Search' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'compare', label: 'Compare' },
];

function SearchPanel() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap gap-8">
        {['Full funding', "Master's", 'Nigeria'].map((filter) => (
          <Badge key={filter} tone="neutral">
            {filter}
          </Badge>
        ))}
      </div>
      <div className="flex flex-col gap-12">
        {[
          { title: 'DAAD Master’s Scholarship', provider: 'DAAD', funding: 'Full funding' },
          { title: 'Mastercard Foundation Scholars', provider: 'Mastercard Foundation', funding: 'Full funding' },
        ].map((r) => (
          <div key={r.title} className="rounded-xl border border-border-faint p-16">
            <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
              {r.provider}
            </p>
            <p className="mt-2 text-ink-indigo" style={{ font: 'var(--font-heading-h4)' }}>
              {r.title}
            </p>
            <Badge tone="warning" className="mt-8">
              {r.funding}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function EligibilityPanel() {
  const checks = ['Nationality', 'Study level', 'Field of study'];
  return (
    <div className="rounded-xl border border-border-faint p-16">
      <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
        DAAD
      </p>
      <p className="mt-2 text-ink-indigo" style={{ font: 'var(--font-heading-h4)' }}>
        DAAD Master’s Scholarship
      </p>
      <Badge tone="success" className="mt-8">
        Eligible for you
      </Badge>
      <ul className="mt-16 flex flex-col gap-6">
        {checks.map((check) => (
          <li key={check} className="flex items-center gap-8 text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
            <span className="text-eligible" aria-hidden="true">
              ✓
            </span>
            {check} matches your profile
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparePanel() {
  const rows = [
    { label: 'Funding', a: 'Full funding', b: 'Full funding' },
    { label: 'Deadline', a: 'Aug 25', b: 'Sep 27' },
    { label: 'Requirements', a: '2 references', b: '2 references' },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-border-faint">
      <table className="w-full min-w-[320px] border-collapse">
        <thead>
          <tr>
            <th className="w-1/3" />
            <th className="p-12 text-left text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
              DAAD
            </th>
            <th className="p-12 text-left text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
              Mastercard
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th
                className="border-t border-border-faint p-12 text-left text-ink-muted"
                style={{ font: 'var(--font-caption)' }}
              >
                {row.label}
              </th>
              <td className="border-t border-border-faint p-12 text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                {row.a}
              </td>
              <td className="border-t border-border-faint p-12 text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                {row.b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductShowcase() {
  const [active, setActive] = useState<TabKey>('search');

  return (
    <RevealOnScroll as="section" className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
      <div className="flex flex-col gap-32 lg:flex-row lg:items-start lg:gap-64">
        <div className="lg:w-2/5">
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
          >
            See it before you use it.
          </h2>
          <p className="mt-8 max-w-[420px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            A quick look at search, eligibility, and comparison: three real parts of the product.
          </p>
          <div className="mt-24 flex gap-8" role="tablist" aria-label="Product preview">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active === tab.key}
                onClick={() => setActive(tab.key)}
                className={cn(
                  'rounded-full px-16 py-8 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo',
                  active === tab.key
                    ? 'bg-ink-indigo text-inverse'
                    : 'bg-surface-warm-light text-ink-indigo hover:bg-surface-warm'
                )}
                style={{ font: 'var(--font-button-label)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-3/5">
          <Card key={active} className="motion-reduce:animate-none animate-fade-in" elevated>
            {active === 'search' && <SearchPanel />}
            {active === 'eligibility' && <EligibilityPanel />}
            {active === 'compare' && <ComparePanel />}
          </Card>
        </div>
      </div>
    </RevealOnScroll>
  );
}
