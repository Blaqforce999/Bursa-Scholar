import { ButtonLink } from '@/components/ui/ButtonLink';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center gap-16 px-16 py-64 text-center">
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h3)', letterSpacing: 'var(--font-heading-h3-letter-spacing)' }}
      >
        Page not found
      </h1>
      <p className="text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
        This scholarship or page may have moved, closed, or never existed. Let&apos;s get you back on
        track.
      </p>
      <ButtonLink href="/scholarships">Find scholarships</ButtonLink>
    </div>
  );
}
