import { getSession } from '@/lib/auth';
import { AppRail } from '@/components/app/AppRail';
import { AssistantProvider } from '@/components/app/AssistantProvider';

/**
 * The Bursa web application shell — distinct from both the marketing site
 * and the auth transition. Nothing here imports MarketingHeader/
 * MarketingFooter, and this layout is never nested inside the marketing
 * layout, so the two shells are structurally incapable of bleeding into
 * each other.
 *
 * This shell holds a mix of public (scholarships discovery) and
 * authenticated (dashboard, saved, compare, profile) routes — discovery
 * must stay account-free per Bursa's "discovery first" principle — so the
 * session/onboarding guard lives on each protected page individually
 * rather than here. AppRail renders a reduced, logged-out-safe nav when
 * there is no session (Discover/Compare only, no avatar).
 *
 * AssistantProvider wraps the whole shell (rail + page content) so both
 * the rail's "Ask" item and any in-page "Ask Bursa" button can open the
 * same overlay without a state library.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  const firstName = user?.name?.split(' ')[0] ?? null;

  return (
    <AssistantProvider firstName={firstName}>
      <div className="flex min-h-screen">
        <AppRail user={user} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1200px] flex-1 px-16 pb-96 pt-72 sm:px-24 lg:px-32 lg:pb-48 lg:pt-32"
        >
          {children}
        </main>
      </div>
    </AssistantProvider>
  );
}
