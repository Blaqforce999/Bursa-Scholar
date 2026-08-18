import Image from 'next/image';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

/**
 * Real photography, not stock-photo filler — one small, deliberate set
 * (matching the hero and How It Works conventions elsewhere on this page).
 * Titles/descriptions sit inside the image on `--gradient-dark-overlay`,
 * the same legibility token already used for the How It Works photo.
 */
const AUDIENCES = [
  {
    heading: 'Undergraduate students',
    body: 'Find funding for your next degree.',
    photo: {
      url: 'https://images.unsplash.com/photo-1759852692971-a2abc6799cbd?fm=jpg&q=80&w=600&auto=format&fit=crop',
      alt: 'An undergraduate student smiling on campus with a backpack and notebook',
    },
  },
  {
    heading: 'Postgraduate students',
    body: 'Explore graduate and research funding.',
    photo: {
      url: 'https://images.unsplash.com/photo-1615891081220-9116de3e1afd?fm=jpg&q=80&w=600&auto=format&fit=crop',
      alt: 'A postgraduate student working confidently on her laptop',
    },
  },
  {
    heading: 'Parents & mentors',
    body: 'Help students find credible opportunities.',
    photo: {
      url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fm=jpg&q=80&w=600&auto=format&fit=crop',
      alt: 'A mentor laughing warmly',
    },
  },
];

export function WhoItsFor() {
  return (
    <RevealOnScroll as="section" className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
      <h2
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Built for African students.
      </h2>

      <div className="mt-40 flex snap-x gap-16 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-24 sm:overflow-visible sm:pb-0">
        {AUDIENCES.map((audience) => (
          <div
            key={audience.heading}
            className="relative aspect-[3/4] w-[70vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-auto sm:shrink"
          >
            <Image
              src={audience.photo.url}
              alt={audience.photo.alt}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover sepia-[0.08] saturate-[0.92]"
            />
            <div className="absolute inset-0" style={{ background: 'var(--gradient-dark-overlay)' }} />
            <div className="absolute inset-x-0 bottom-0 p-24">
              <h3
                className="text-inverse"
                style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
              >
                {audience.heading}
              </h3>
              <p className="mt-4 text-inverse/80" style={{ font: 'var(--font-body-regular)' }}>
                {audience.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}
