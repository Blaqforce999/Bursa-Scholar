import { Logo } from '@/components/shared/Logo';

/**
 * The transition between the public site and the authenticated app:
 * login, signup, and onboarding. Deliberately its own minimal shell —
 * neither the marketing header/footer nor the app's navigation belongs
 * here; this boundary exists precisely so neither can bleed in.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-faint">
        <div className="mx-auto flex h-64 max-w-[1200px] items-center px-16 sm:px-24">
          <Logo />
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
