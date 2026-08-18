import Image from 'next/image';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

/**
 * The hero-right cluster is illustrative product UI, not live data — the
 * same convention the rest of the marketing site already uses for sample
 * search results. Content and delays are data so the cascade timing
 * (largest/back card first, ~180ms stagger, front-to-back, ~1.8s total
 * sequence including the headline/paragraph/CTA) stays in one place
 * instead of scattered across JSX.
 */
const DESTINATIONS = ['Germany', 'Canada', 'United Kingdom'];

const STUDENT_IMAGE = {
  url: 'https://images.unsplash.com/photo-1500301111609-42f1aa6df72a?fm=jpg&q=80&w=800&auto=format&fit=crop',
  alt: 'A young woman laughing while traveling abroad',
  source: 'https://unsplash.com/photos/woman-standing-behind-eiffel-tower-during-daytime-Ycds6emp7BA',
};

const CLUSTER_CARDS: Array<{
  key: string;
  delayMs: number;
  desktop: string;
  content: React.ReactNode;
}> = [
  {
    key: 'explore',
    delayMs: 270,
    desktop: 'lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:w-[300px]',
    content: (
      <Card className="flex flex-col gap-12" style={{ background: 'var(--gradient-marigold-to-white)' }}>
        <p className="text-ink-indigo" style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}>
          Explore your destinations
        </p>
        <div className="flex flex-wrap gap-8">
          {DESTINATIONS.map((place) => (
            <Badge key={place} tone="neutral">
              {place}
            </Badge>
          ))}
        </div>
      </Card>
    ),
  },
  {
    key: 'stats',
    delayMs: 450,
    desktop: 'lg:absolute lg:left-0 lg:top-64 lg:z-20 lg:w-[200px]',
    content: (
      <Card className="flex flex-col gap-12" elevated>
        <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
          Your matches
        </p>
        <div className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between">
            <span className="text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
              Scholarships
            </span>
            <span className="text-ink-indigo" style={{ font: 'var(--font-data-large)' }}>
              12
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-ink-muted-dark" style={{ font: 'var(--font-body-small)' }}>
              Countries
            </span>
            <span className="text-ink-indigo" style={{ font: 'var(--font-data-large)' }}>
              5
            </span>
          </div>
        </div>
      </Card>
    ),
  },
  {
    // The larger, aspirational visual — takes the position the DAAD card
    // used to hold. Real photography (the one deliberate exception to the
    // "no stock photos" rule elsewhere on the site), not a stock-photo
    // gallery: one image, chosen for the moment it captures, not decoration.
    key: 'image',
    delayMs: 630,
    desktop: 'lg:absolute lg:left-8 lg:top-[228px] lg:z-30 lg:w-[280px]',
    content: (
      <Card className="relative aspect-[3/4] overflow-hidden p-0" elevated>
        <Image
          src={STUDENT_IMAGE.url}
          alt={STUDENT_IMAGE.alt}
          fill
          sizes="280px"
          className="object-cover"
        />
        <div
          className="absolute inset-x-0 bottom-0 flex items-end p-16"
          style={{ background: 'var(--gradient-dark-overlay)' }}
        >
          <p className="text-inverse" style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}>
            Where your scholarship can take you.
          </p>
        </div>
      </Card>
    ),
  },
  {
    // Smaller and front-most now — swapped with the image card's old,
    // larger slot.
    key: 'daad',
    delayMs: 800,
    desktop: 'lg:absolute lg:right-4 lg:bottom-0 lg:z-40 lg:w-[220px]',
    content: (
      <Card className="flex flex-col gap-8" elevated>
        <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
          German Academic Exchange Service
        </p>
        <p className="text-ink-indigo" style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}>
          DAAD Master&rsquo;s Scholarship
        </p>
        <div className="flex flex-wrap gap-8">
          <Badge tone="warning">Full funding</Badge>
          <Badge tone="success">Eligible</Badge>
        </div>
      </Card>
    ),
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-16 pt-32 pb-48 sm:px-24 sm:pt-48 lg:pb-96 lg:pt-96">
      <div className="flex flex-col gap-32 lg:flex-row lg:items-center lg:gap-64">
        <div className="flex flex-col gap-24 lg:w-1/2">
          <h1
            className="animate-cascade-in text-ink-indigo [font:var(--font-heading-h1)] [letter-spacing:var(--font-heading-h1-letter-spacing)] md:[font:var(--font-display-large)] md:[letter-spacing:var(--font-display-large-letter-spacing)]"
          >
            Find scholarships worth applying for.
          </h1>
          <p
            className="animate-cascade-in max-w-[480px] text-ink-muted-dark md:hidden"
            style={{ font: 'var(--font-body-large)', animationDelay: '160ms' }}
          >
            Search by study level, field, and funding. See eligibility, compare, and apply.
          </p>
          <p
            className="animate-cascade-in hidden max-w-[480px] text-ink-muted-dark md:block"
            style={{ font: 'var(--font-body-large)', animationDelay: '160ms' }}
          >
            Search by study level, field, destination, and funding. See your eligibility, compare
            your options, and apply through the official source.
          </p>
          <div className="animate-cascade-in flex flex-col gap-12 sm:flex-row" style={{ animationDelay: '320ms' }}>
            <ButtonLink href="/auth?mode=signup" size="lg">
              Create free account
            </ButtonLink>
            <ButtonLink href="#how-it-works" size="lg" variant="ghost">
              How it works
            </ButtonLink>
          </div>
        </div>

        <div className="flex flex-col gap-16 lg:relative lg:h-[520px] lg:w-1/2 lg:gap-0">
          {CLUSTER_CARDS.map((card) => (
            <div
              key={card.key}
              className={cn('animate-cascade-in', card.desktop)}
              style={{ animationDelay: `${card.delayMs}ms` }}
            >
              {card.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
