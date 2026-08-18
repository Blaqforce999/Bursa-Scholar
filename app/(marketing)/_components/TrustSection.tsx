import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

const points = [
  {
    heading: 'Verified official sources',
    body: 'Every listing links to a real, checked official source. Broken links get flagged and fixed, never silently swapped.',
  },
  {
    heading: 'Deterministic eligibility',
    body: 'No black-box AI guessing. Matches are rule-based and explainable, and never guarantee acceptance.',
  },
  {
    heading: 'Honest deadlines',
    body: 'Deadline urgency reflects maintained data only. No fake countdowns, no manufactured urgency.',
  },
  {
    heading: 'Free, always',
    body: 'Bursa never charges to search, save, or compare, and never processes payments or application fees.',
  },
];

export function TrustSection() {
  return (
    <section style={{ background: 'var(--gradient-warm-surface)' }}>
      <RevealOnScroll className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
        <p
          className="text-ink-muted"
          style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}
        >
          TRUST & VERIFICATION
        </p>
        <h2
          className="mt-12 max-w-[560px] text-ink-indigo"
          style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
        >
          Built around information you can trust
        </h2>
        <dl className="mt-32 grid gap-16 sm:grid-cols-2">
          {points.map((point) => (
            <div
              key={point.heading}
              className="flex flex-col gap-8 rounded-2xl border border-border-faint bg-surface-white p-24"
            >
              <dt
                className="text-ink-indigo"
                style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
              >
                {point.heading}
              </dt>
              <dd className="text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
                {point.body}
              </dd>
            </div>
          ))}
        </dl>
      </RevealOnScroll>
    </section>
  );
}
