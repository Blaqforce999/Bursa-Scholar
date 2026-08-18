'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { CloseIcon, ChevronRightIcon, HelpIcon, UserIcon } from '@/components/shared/icons';
import type { NavItem } from '@/components/app/AppRail';

const APP_VERSION = 'v0.1.0';
const SWIPE_CLOSE_THRESHOLD_PX = 80;
const SWIPE_DEADZONE_PX = 10;

type MobileDrawerUser = { name: string | null } | null;

type MobileDrawerProps = {
  // required props first
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  activePath: string;
  onAsk: () => void;
  onHelp: () => void;
  onLogout: () => void;
  user: MobileDrawerUser;
};

/**
 * The mobile-only (md:hidden) left-hand nav drawer — the sole mobile nav
 * surface, since AppRail no longer renders a bottom tab bar. Renders the
 * same NavItem list as the desktop rail, in the same order, so mobile and
 * desktop navigation never drift apart.
 */
export function MobileDrawer({ isOpen, onClose, navItems, activePath, onAsk, onHelp, onLogout, user }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const isHorizontalDrag = useRef(false);

  const initials =
    (user?.name ?? 'You')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'Y';

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = { position: style.position, top: style.top, left: style.left, right: style.right };
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  function handlePointerDown(event: React.PointerEvent) {
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    isDragging.current = true;
    isHorizontalDrag.current = false;
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null) return;
    const dx = event.clientX - dragStartX.current;
    const dy = event.clientY - dragStartY.current;

    if (!isHorizontalDrag.current) {
      if (Math.abs(dx) < SWIPE_DEADZONE_PX && Math.abs(dy) < SWIPE_DEADZONE_PX) return;
      // Only claim the gesture once it's clearly a horizontal swipe — a
      // mostly-vertical move is a tap or a scroll attempt, not a dismiss.
      if (Math.abs(dy) > Math.abs(dx)) {
        isDragging.current = false;
        return;
      }
      isHorizontalDrag.current = true;
    }

    setDragX(Math.min(0, dx));
  }

  function handlePointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (isHorizontalDrag.current && dragX < -SWIPE_CLOSE_THRESHOLD_PX) {
      onClose();
    }
    setDragX(0);
    isHorizontalDrag.current = false;
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-ink-indigo/40 transition-opacity duration-200 motion-reduce:transition-none md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        aria-hidden={!isOpen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={dragX < 0 ? { transform: `translateX(${dragX}px)`, transition: 'none' } : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-[360px] flex-col bg-surface-white shadow-lg transition-transform duration-300 motion-reduce:transition-none md:hidden',
          isOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        )}
      >
        <div
          className="select-none bg-ink-indigo px-20 pb-24"
          style={{ paddingTop: 'calc(24px + env(safe-area-inset-top))' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-12">
              {user ? (
                <span
                  className="flex h-48 w-48 items-center justify-center rounded-full bg-marigold text-ink-indigo"
                  style={{ font: 'var(--font-heading-h4)' }}
                >
                  {initials}
                </span>
              ) : (
                <span className="flex h-48 w-48 items-center justify-center rounded-full border border-white/30 text-inverse">
                  <UserIcon className="h-22 w-22" />
                </span>
              )}
              <span className="text-inverse" style={{ font: 'var(--font-heading-h4)' }}>
                {user ? user.name ?? 'You' : 'Log in to Bursa'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-40 w-40 items-center justify-center rounded-full text-inverse/80 transition hover:bg-white/10 hover:text-inverse"
            >
              <CloseIcon className="h-20 w-20" />
            </button>
          </div>
          {!user && (
            <Link
              href="/auth?mode=login"
              onClick={onClose}
              className="mt-16 inline-flex h-44 items-center rounded-full bg-white/10 px-20 text-inverse transition hover:bg-white/20"
              style={{ font: 'var(--font-button-label)' }}
            >
              Log in
            </Link>
          )}
        </div>

        <nav aria-label="Primary" className="flex flex-1 flex-col overflow-y-auto py-8">
          {navItems.map((item) => {
            if (item.isAsk) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onClose();
                    onAsk();
                  }}
                  className="flex min-h-44 select-none items-center gap-12 px-20 py-12 text-left transition hover:bg-surface-warm-light active:bg-surface-warm-light"
                >
                  <span className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-ink-indigo text-marigold">
                    <item.Icon className="h-16 w-16" />
                  </span>
                  <span className="flex-1 text-ink-indigo" style={{ font: 'var(--font-button-label)' }}>
                    {item.label} Bursa
                  </span>
                  <ChevronRightIcon className="h-18 w-18 shrink-0 text-ink-muted" />
                </button>
              );
            }

            const active = activePath === item.href;
            return (
              <Link
                key={item.key}
                href={item.href!}
                onClick={onClose}
                className="flex min-h-44 select-none items-center gap-12 px-20 py-12 text-ink-indigo transition hover:bg-surface-warm-light active:bg-surface-warm-light"
              >
                <span
                  className={cn(
                    'flex h-32 w-32 shrink-0 items-center justify-center rounded-full',
                    active ? 'bg-ink-indigo/10 text-ink-indigo' : 'text-ink-muted'
                  )}
                >
                  <item.Icon className="h-20 w-20" />
                </span>
                <span style={{ font: 'var(--font-button-label)' }}>{item.label}</span>
              </Link>
            );
          })}

          <div className="my-8 border-t border-border-faint" />

          <p
            className="select-none px-20 pb-4 pt-16 text-ink-muted"
            style={{ font: 'var(--font-caption)', letterSpacing: '0.06em' }}
          >
            ACCOUNT
          </p>

          {user && (
            <Link
              href="/profile"
              onClick={onClose}
              className="flex min-h-44 select-none items-center px-20 py-12 text-ink-indigo transition hover:bg-surface-warm-light active:bg-surface-warm-light"
              style={{ font: 'var(--font-body-regular)' }}
            >
              Profile
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onHelp();
            }}
            className="flex min-h-44 select-none items-center gap-8 px-20 py-12 text-left text-ink-indigo transition hover:bg-surface-warm-light active:bg-surface-warm-light"
            style={{ font: 'var(--font-body-regular)' }}
          >
            <HelpIcon className="h-18 w-18 text-ink-muted" />
            Help
          </button>

          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex min-h-44 select-none items-center px-20 py-12 text-left text-ink-indigo transition hover:bg-surface-warm-light active:bg-surface-warm-light"
              style={{ font: 'var(--font-body-regular)' }}
            >
              Log out
            </button>
          )}
        </nav>

        <div
          className="flex select-none items-center justify-between border-t border-border-faint px-20 pt-16 text-ink-muted"
          style={{ font: 'var(--font-caption)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        >
          <span>Legal</span>
          <span>{APP_VERSION}</span>
        </div>
      </div>
    </>
  );
}
