import { ButtonLink } from '@/components/ui/ButtonLink';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';

export function CtaBand() {
  return (
    <section className="bg-ink-indigo">
      <RevealOnScroll className="mx-auto flex max-w-[1200px] flex-col items-center gap-16 px-16 py-64 text-center sm:px-24 lg:py-96">
        <h2
          className="max-w-[720px] text-inverse"
          style={{ font: 'var(--font-heading-h1)', letterSpacing: 'var(--font-heading-h1-letter-spacing)' }}
        >
          Your next opportunity could be one search away.
        </h2>
        <p className="max-w-[480px] text-inverse/80" style={{ font: 'var(--font-body-large)' }}>
          Explore scholarships built around your goals, eligibility, and destination.
        </p>
        <div className="mt-16 flex flex-col gap-12 sm:flex-row">
          <ButtonLink href="/scholarships" size="lg" variant="secondary">
            Find scholarships
          </ButtonLink>
          <ButtonLink
            href="/auth?mode=signup"
            size="lg"
            variant="ghost"
            className="text-inverse hover:bg-white/10"
          >
            Create free account
          </ButtonLink>
        </div>
      </RevealOnScroll>
    </section>
  );
}
