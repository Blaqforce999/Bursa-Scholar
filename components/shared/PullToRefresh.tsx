'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const PULL_THRESHOLD_PX = 64;
const MAX_PULL_PX = 96;
const PULL_RESISTANCE = 0.5;

type PullToRefreshProps = {
  children: React.ReactNode;
};

/**
 * Mobile-only pull-to-refresh for server-rendered feeds (Home, Discover).
 * "Refresh" means re-running the page's server component with the same
 * params via router.refresh() — there's no separate client data source to
 * re-fetch. touchmove is bound manually (not via onTouchMove) because
 * React's synthetic touch handlers are passive by default, which silently
 * ignores preventDefault() and lets the browser's own overscroll/refresh
 * fire alongside ours.
 */
export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function atPageTop() {
      return window.scrollY <= 0;
    }

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshing || !atPageTop()) {
        startY.current = null;
        return;
      }
      startY.current = event.touches[0].clientY;
    }

    function handleTouchMove(event: TouchEvent) {
      if (startY.current === null || isRefreshing) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0 || !atPageTop()) {
        setPullDistance(0);
        return;
      }
      // Suppress the browser's own native overscroll/refresh while ours is
      // actively engaged, so the two never both fire for one gesture.
      event.preventDefault();
      setPullDistance(Math.min(delta * PULL_RESISTANCE, MAX_PULL_PX));
    }

    function handleTouchEnd() {
      if (startY.current === null) return;
      startY.current = null;
      setPullDistance((current) => {
        if (current > PULL_THRESHOLD_PX && !isRefreshing) {
          setIsRefreshing(true);
          router.refresh();
          window.setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 700);
          return PULL_THRESHOLD_PX;
        }
        return 0;
      });
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isRefreshing, router]);

  return (
    <div ref={containerRef}>
      <div
        aria-hidden="true"
        style={{ height: pullDistance }}
        className={cn(
          'flex items-center justify-center overflow-hidden md:hidden',
          pullDistance > 0 && 'transition-[height] duration-200 motion-reduce:transition-none'
        )}
      >
        <div
          className={cn(
            'h-24 w-24 rounded-full border-2 border-border border-t-ink-indigo',
            isRefreshing && 'animate-spin'
          )}
          style={!isRefreshing ? { transform: `rotate(${pullDistance * 3}deg)` } : undefined}
        />
      </div>
      {children}
    </div>
  );
}
