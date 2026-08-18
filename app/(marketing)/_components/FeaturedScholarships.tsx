import { searchScholarships } from '@/lib/scholarships';
import { RevealOnScroll } from '@/components/shared/RevealOnScroll';
import { FeaturedScholarshipsGrid } from '@/app/(marketing)/_components/FeaturedScholarshipsGrid';

const PREVIEW_COUNT = 6;

export async function FeaturedScholarships() {
  const { scholarships } = await searchScholarships({});
  const preview = scholarships.slice(0, PREVIEW_COUNT);
  if (preview.length === 0) return null;

  return (
    <section>
      <RevealOnScroll className="mx-auto max-w-[1200px] px-16 py-48 sm:px-24 lg:py-96">
        <p className="text-ink-muted" style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}>
          A REAL SAMPLE
        </p>
        <h2
          className="mt-12 max-w-[560px] text-ink-indigo"
          style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
        >
          Scholarships open right now
        </h2>
        <p className="mt-8 max-w-[560px] text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
          A preview of real, curated opportunities. Sign up to see all of them, plus your personal matches.
        </p>
        <div className="mt-32">
          <FeaturedScholarshipsGrid scholarships={preview} />
        </div>
      </RevealOnScroll>
    </section>
  );
}
