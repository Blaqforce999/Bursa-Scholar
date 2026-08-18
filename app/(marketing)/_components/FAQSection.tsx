import { RevealOnScroll } from '@/components/shared/RevealOnScroll';
import { FAQCards } from '@/app/(marketing)/_components/FAQCards';
import { LANDING_FAQ_ITEMS } from '@/lib/faq';

export function FAQSection() {
  return (
    <section>
      <RevealOnScroll className="mx-auto max-w-[720px] px-16 py-48 sm:px-24 lg:py-96">
        <p className="text-ink-muted" style={{ font: 'var(--font-caption)', letterSpacing: '0.08em' }}>
          FAQ
        </p>
        <h2
          className="mt-12 text-ink-indigo"
          style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
        >
          Questions before you sign up
        </h2>
        <div className="mt-32">
          <FAQCards items={LANDING_FAQ_ITEMS} />
        </div>
      </RevealOnScroll>
    </section>
  );
}
