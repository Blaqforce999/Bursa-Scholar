import Image from 'next/image';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

const STUDENT_PHOTO = {
  url: 'https://images.unsplash.com/photo-1620829813573-7c9e1877706f?fm=jpg&q=80&w=800&auto=format&fit=crop',
  alt: 'A student focused on his laptop',
  source: 'https://unsplash.com/photos/man-in-gray-crew-neck-t-shirt-using-laptop-computer-KUzlAah2dog',
};

const steps = [
  { heading: 'Search', body: 'Find scholarships that match what you’re looking for.' },
  { heading: 'Check', body: 'Understand eligibility and requirements before applying.' },
  { heading: 'Compare', body: 'Save the opportunities worth considering.' },
  { heading: 'Apply', body: "Continue to the scholarship provider's official website." },
];

export function HowItWorks() {
  return (
    <RevealOnScroll as="section" id="how-it-works" className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
      <div className="flex flex-col gap-40 lg:flex-row lg:gap-64">
        <div className="lg:w-1/2">
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
          >
            How Bursa works
          </h2>

          <ol className="mt-40 flex flex-col">
            {steps.map((step, index) => (
              <li
                key={step.heading}
                className="border-t border-border-faint py-20 first:border-t-0 first:pt-0"
              >
                <div className="flex items-baseline gap-12">
                  <span className="text-marigold-dark" style={{ font: 'var(--font-data-regular)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="text-ink-indigo"
                    style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
                  >
                    {step.heading}
                  </h3>
                </div>
                <p className="mt-4 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <ButtonLink href="/scholarships" size="lg" className="mt-32">
            Find scholarships
          </ButtonLink>
        </div>

        <div className="lg:w-1/2">
          <div className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-24 sm:p-32">
            <Image
              src={STUDENT_PHOTO.url}
              alt={STUDENT_PHOTO.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {/* Tints the photo into Bursa's own palette instead of letting
                it sit as a plain, disconnected rectangle. */}
            <div className="absolute inset-0 mix-blend-overlay" style={{ background: 'var(--gradient-brand-blend)' }} />
            <div className="absolute inset-0" style={{ background: 'var(--gradient-dark-overlay)' }} />
            <Card className="relative flex flex-col gap-12" elevated>
              <p className="text-ink-muted" style={{ font: 'var(--font-caption)' }}>
                African Union Commission
              </p>
              <p
                className="text-ink-indigo"
                style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
              >
                African Union PhD Research Grant
              </p>
              <div className="flex flex-wrap gap-8">
                <Badge tone="success">Eligible for you</Badge>
              </div>
              <ButtonLink href="/scholarships" size="md" className="self-start">
                Apply on official site
              </ButtonLink>
            </Card>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
