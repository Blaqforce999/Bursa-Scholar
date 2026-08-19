'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { LogoMark } from '@/components/shared/LogoMark';
import { useAssistant } from '@/components/app/AssistantProvider';
import { HelpModal } from '@/components/app/HelpModal';
import { MobileDrawer } from '@/components/app/MobileDrawer';
import { DeleteAccountModal } from '@/components/app/DeleteAccountModal';
import { LogoutConfirmModal } from '@/components/app/LogoutConfirmModal';
import { HomeIcon, DiscoverIcon, SparkIcon, SavedIcon, CompareIcon, HelpIcon, UserIcon, MenuIcon } from '@/components/shared/icons';
import type { ComponentType, SVGProps } from 'react';

type AppRailUser = { name: string | null } | null;

export type NavItem = {
  key: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  isAsk?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', Icon: HomeIcon, href: '/dashboard' },
  { key: 'discover', label: 'Discover', Icon: DiscoverIcon, href: '/scholarships' },
  { key: 'ask', label: 'Ask', Icon: SparkIcon, isAsk: true },
  { key: 'saved', label: 'Saved', Icon: SavedIcon, href: '/saved' },
  { key: 'compare', label: 'Compare', Icon: CompareIcon, href: '/compare' },
];

/**
 * The app's whole navigation shell: a sticky icon+label rail on desktop
 * (unchanged), a compact brand+menu strip on mobile with no bottom tab bar
 * at all — every destination (Home, Discover, Ask, Saved, Compare, plus
 * Help/Profile/Log out) lives in the slide-out drawer (MobileDrawer),
 * mirroring the desktop rail's own order and grouping.
 */
export function AppRail({ user }: { user: AppRailUser }) {
  const pathname = usePathname();
  const { open: openAssistant } = useAssistant();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // An anonymous visitor can still browse Discover/Compare (Bursa's
  // "discovery first" principle) but Home/Ask/Saved all assume a session.
  const items = user ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.key === 'discover' || item.key === 'compare');

  function closeDrawer() {
    setIsDrawerOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <>
      <nav
        aria-label="Primary"
        className="sticky top-0 hidden h-screen w-[86px] shrink-0 flex-col items-center border-r border-border-faint bg-surface-white py-16 lg:flex"
      >
        <Link href="/dashboard" aria-label="Bursa home" className="mb-24">
          <LogoMark />
        </Link>

        <ul className="flex flex-1 flex-col items-center gap-8">
          {items.map((item) => (
            <li key={item.key} className="w-full">
              <RailItem item={item} active={pathname === item.href} onAsk={openAssistant} />
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-12">
          <button
            type="button"
            aria-label="Help"
            onClick={() => setIsHelpOpen(true)}
            className="flex h-40 w-40 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo"
          >
            <HelpIcon className="h-20 w-20" />
          </button>
          {user ? (
            <AvatarMenu
              user={user}
              onLogout={() => setIsLogoutConfirmOpen(true)}
              onDeleteAccount={() => setIsDeleteAccountOpen(true)}
            />
          ) : (
            <AccountEntry />
          )}
        </div>
      </nav>

      <header className="fixed inset-x-0 top-0 z-30 flex h-56 items-center gap-8 border-b border-border-faint bg-surface-white px-8 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open menu"
          onClick={() => setIsDrawerOpen(true)}
          className="flex h-44 w-44 shrink-0 items-center justify-center rounded-full text-ink-indigo transition hover:bg-surface-warm-light active:bg-surface-warm-light"
        >
          <MenuIcon className="h-22 w-22" />
        </button>
        <Link href="/dashboard" aria-label="Bursa home" className="flex-1">
          <LogoMark />
        </Link>
      </header>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        navItems={items}
        activePath={pathname}
        onAsk={openAssistant}
        onHelp={() => setIsHelpOpen(true)}
        onLogout={() => setIsLogoutConfirmOpen(true)}
        onDeleteAccount={() => setIsDeleteAccountOpen(true)}
        user={user}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <DeleteAccountModal isOpen={isDeleteAccountOpen} onClose={() => setIsDeleteAccountOpen(false)} />
      <LogoutConfirmModal isOpen={isLogoutConfirmOpen} onClose={() => setIsLogoutConfirmOpen(false)} />
    </>
  );
}

function RailItem({ item, active, onAsk }: { item: NavItem; active: boolean; onAsk: () => void }) {
  const { label, Icon } = item;

  const iconSlot = item.isAsk ? (
    <span className="flex h-32 w-32 items-center justify-center rounded-xl bg-ink-indigo text-marigold">
      <Icon className="h-16 w-16" />
    </span>
  ) : (
    <span
      className={cn(
        'flex h-32 w-32 items-center justify-center rounded-full',
        active ? 'bg-ink-indigo/10 text-ink-indigo' : 'text-ink-muted'
      )}
    >
      <Icon className="h-20 w-20" />
    </span>
  );

  const content = (
    <span className="flex select-none flex-col items-center gap-2 py-6" style={{ font: 'var(--font-caption)' }}>
      {iconSlot}
      <span className={active ? 'text-ink-indigo' : 'text-ink-muted'}>{label}</span>
    </span>
  );

  if (item.isAsk) {
    return (
      <button
        type="button"
        onClick={onAsk}
        aria-label="Ask Bursa"
        className="flex min-h-44 w-full flex-col items-center justify-center transition hover:opacity-80 active:opacity-70"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href!}
      className="flex min-h-44 w-full flex-col items-center justify-center transition hover:bg-surface-warm-light active:bg-surface-warm-light"
    >
      {content}
    </Link>
  );
}

function AvatarMenu({
  user,
  onLogout,
  onDeleteAccount,
}: {
  user: { name: string | null };
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initials =
    (user.name ?? 'You')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'Y';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-36 w-36 items-center justify-center rounded-full bg-ink-indigo text-inverse"
        style={{ font: 'var(--font-caption)' }}
      >
        {initials}
      </button>

      {isOpen && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-8 flex w-160 flex-col gap-4 rounded-xl border border-border-faint bg-surface-white p-8 shadow-lg lg:right-auto lg:top-auto lg:bottom-0 lg:left-full lg:mt-0 lg:ml-8"
          >
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-12 py-8 text-ink-indigo transition hover:bg-surface-warm-light"
              style={{ font: 'var(--font-body-small)' }}
            >
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="rounded-lg px-12 py-8 text-left text-ink-indigo transition hover:bg-surface-warm-light"
              style={{ font: 'var(--font-body-small)' }}
            >
              Log out
            </button>
            <div className="my-4 border-t border-border-faint" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onDeleteAccount();
              }}
              className="rounded-lg px-12 py-8 text-left text-danger transition hover:bg-danger-light"
              style={{ font: 'var(--font-body-small)' }}
            >
              Delete account
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Where the avatar would go, for a visitor browsing without an account. */
function AccountEntry() {
  return (
    <Link
      href="/auth?mode=login"
      aria-label="Log in"
      title="Log in"
      className="flex h-36 w-36 items-center justify-center rounded-full border border-border text-ink-indigo transition hover:bg-surface-warm-light"
    >
      <UserIcon className="h-18 w-18" />
    </Link>
  );
}
