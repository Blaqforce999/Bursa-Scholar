import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getScholarshipBySlug } from '@/lib/scholarships';
import { getSession } from '@/lib/auth';
import { getCompareIds } from '@/lib/compare';
import { getEligibility } from '@/lib/eligibility';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { FundingBadge } from '@/components/scholarship/FundingBadge';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { EligibilityBadge } from '@/components/scholarship/EligibilityBadge';
import { SaveButton } from '@/components/scholarship/SaveButton';
import { CompareButton } from '@/components/scholarship/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { BackToResultsButton } from '@/components/scholarship/BackToResultsButton';
import { STUDY_LEVEL_LABELS } from '@/lib/constants';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

/** Only ever a same-origin relative path — never trust `from` as an
 *  absolute or protocol-relative URL, which could redirect off Bursa. */
function sanitizeReturnTo(from: string | undefined): string | undefined {
  if (!from) return undefined;
  if (!from.startsWith('/') || from.startsWith('//')) return undefined;
  return from;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) return {};

  return {
    title: `${scholarship.title} · ${scholarship.provider} | Bursa`,
    description: scholarship.benefits.slice(0, 160),
    openGraph: {
      title: scholarship.title,
      description: scholarship.benefits.slice(0, 160),
    },
  };
}

export default async function ScholarshipDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const returnTo = sanitizeReturnTo(from);

  // Full detail (and the apply CTA it leads to) is part of the
  // authenticated workflow — anonymous visitors can search and browse, but
  // opening a specific scholarship requires signing in first. Enforced here
  // at the route itself, not just by hiding a link in the UI.
  const user = await getSession();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/scholarships/${slug}`)}`);

  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) notFound();

  const compareIds = await getCompareIds();

  const isSaved = Boolean(
    await db.savedScholarship.findUnique({
      where: { userId_scholarshipId: { userId: user.id, scholarshipId: scholarship.id } },
    })
  );

  const eligibility = getEligibility(
    { nationality: user.nationality, studyLevel: user.studyLevel, fieldOfStudy: user.fieldOfStudy },
    scholarship
  );

  // Deadline urgency is inherently wall-clock-relative and re-evaluated on
  // every server render against live data — there is no pure alternative.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isClosed =
    scholarship.status === 'CLOSED' ||
    scholarship.status === 'ARCHIVED' ||
    (scholarship.deadlineAt !== null && scholarship.deadlineAt.getTime() < now);
  const applyUrl = scholarship.applicationUrl ?? scholarship.officialUrl;

  return (
    <div className="mx-auto max-w-[840px] pb-[calc(88px_+_env(safe-area-inset-bottom))] md:pb-0">
      <div className="mb-16">
        <BackToResultsButton from={returnTo} />
      </div>

      <p className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
        {scholarship.provider} · Bursa is a discovery layer. Applications happen on the official site.
      </p>
      <h1
        className="mt-8 text-ink-indigo"
        style={{ font: 'var(--font-display-small)', letterSpacing: 'var(--font-display-small-letter-spacing)' }}
      >
        {scholarship.title}
      </h1>

      <div className="mt-16 flex flex-wrap items-center gap-8">
        <FundingBadge level={scholarship.fundingLevel} />
        <DeadlineBadge deadlineAt={scholarship.deadlineAt} status={scholarship.status} />
        {eligibility !== null && <EligibilityBadge result={eligibility} />}
      </div>

      <div className="mt-24 flex flex-wrap items-center gap-12">
        <SaveButton scholarshipId={scholarship.id} initialSaved={isSaved} isLoggedIn />
        <CompareButton scholarshipId={scholarship.id} initialSelected={compareIds.includes(scholarship.id)} />
        <ShareButton title={scholarship.title} />
      </div>

      <div className="mt-32 flex flex-col gap-24">
        <section>
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            Funding covered
          </h2>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            {scholarship.benefits}
          </p>
        </section>

        <section>
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            Eligibility
          </h2>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            {scholarship.eligibility}
          </p>
          <dl className="mt-12 flex flex-col gap-4">
            <div className="flex gap-8">
              <dt className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                Study level:
              </dt>
              <dd className="text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                {scholarship.studyLevels.map((level) => STUDY_LEVEL_LABELS[level]).join(', ')}
              </dd>
            </div>
            <div className="flex gap-8">
              <dt className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                Field of study:
              </dt>
              <dd className="text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                {scholarship.fieldsOfStudy.join(', ')}
              </dd>
            </div>
            <div className="flex gap-8">
              <dt className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                Eligible nationalities:
              </dt>
              <dd className="text-ink-indigo" style={{ font: 'var(--font-body-small)' }}>
                {scholarship.openToAllAfrican ? 'Open to all African nationalities' : scholarship.eligibleNationalities.join(', ')}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            Requirements
          </h2>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            {scholarship.requirements}
          </p>
        </section>

        <section>
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            Host country
          </h2>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            {scholarship.hostCountry} ({scholarship.region})
          </p>
        </section>

        <Card>
          <h2
            className="text-ink-indigo"
            style={{ font: 'var(--font-heading-h4)', letterSpacing: 'var(--font-heading-h4-letter-spacing)' }}
          >
            How to apply
          </h2>
          <p className="mt-8 text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
            Bursa does not accept applications directly. Selecting &ldquo;Apply on official site&rdquo; takes you to{' '}
            {scholarship.provider}&apos;s own application page, where you complete and submit your
            application.
          </p>
          {isClosed && (
            <p className="mt-8 text-danger" style={{ font: 'var(--font-body-small)' }}>
              This opportunity is closed and shown for reference only. The link below may no longer accept
              applications.
            </p>
          )}
          <div className="mt-16 hidden md:block">
            <ButtonLink
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant={isClosed ? 'secondary' : 'primary'}
            >
              {isClosed ? 'Visit official site' : 'Apply on official site'}
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* Sticky mobile apply bar: pinned flush to the bottom of the
          viewport (there's no bottom nav bar to clear anymore), dvh/safe-
          area aware so it never sits behind the home indicator or browser
          chrome. The page's own bottom padding above reserves exactly this
          bar's height so scrolled content never ends up hidden behind it. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-white p-16 shadow-lg md:hidden">
        <div
          className="mx-auto max-w-[840px]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ButtonLink
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            variant={isClosed ? 'secondary' : 'primary'}
            className="w-full"
          >
            {isClosed ? 'Visit official site' : 'Apply on official site'}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
