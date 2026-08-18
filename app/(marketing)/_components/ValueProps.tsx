import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

const VALUE_PROPS = [
  {
    heading: 'Find relevant opportunities',
    body: 'Search by study level, field, country, funding, and deadline.',
  },
  {
    heading: 'Know where you stand',
    body: 'See eligibility requirements clearly before you invest time applying.',
    accent: true,
  },
  {
    heading: 'Compare your options',
    body: 'Save and compare scholarships side by side.',
  },
  {
    heading: 'Apply at the source',
    body: "Go directly to the provider's official application page.",
  },
];

export function ValueProps() {
  return (
    <RevealOnScroll as="section" className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
      <p
        className="text-ink-muted"
        style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}
      >
        WHY STUDENTS USE BURSA
      </p>
      <h2
        className="mt-12 max-w-[560px] text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Scholarship search without the guesswork.
      </h2>
      <p className="mt-12 max-w-[480px] text-ink-muted-dark" style={{ font: 'var(--font-body-large)' }}>
        Four steps stand between a long list of scholarships and the one worth applying for.
      </p>

      <dl className="mt-40 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map((item) => (
          <div
            key={item.heading}
            className={
              item.accent
                ? 'flex flex-col gap-16 rounded-2xl bg-ink-indigo p-32 lg:p-40'
                : 'flex flex-col gap-16 rounded-2xl bg-surface-warm-light p-32 lg:p-40'
            }
          >
            <dt
              className={item.accent ? 'text-inverse' : 'text-ink-indigo'}
              style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
            >
              {item.heading}
            </dt>
            <div
              className={item.accent ? 'border-t border-dashed border-white/30' : 'border-t border-dashed border-border-firm'}
            />
            <dd
              className={item.accent ? 'text-inverse/80' : 'text-ink-muted-dark'}
              style={{ font: 'var(--font-body-regular)' }}
            >
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </RevealOnScroll>
  );
}
