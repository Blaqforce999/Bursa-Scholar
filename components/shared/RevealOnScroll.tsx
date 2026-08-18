'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Extends the hero's entrance cascade (`.animate-cascade-in` in
 * globals.css) to sections below the fold, triggered on scroll instead of
 * on mount. Same keyframe, same easing, same duration — nothing new here,
 * just a different trigger.
 *
 * Reduced motion is handled entirely in CSS (`.reveal-pending` and
 * `.animate-cascade-in` are both neutralized under
 * `prefers-reduced-motion: reduce` in globals.css), so this component
 * doesn't need to branch on it — no hydration mismatch, no extra render.
 *
 * `as` lets this render as the section's own root tag (e.g. "section",
 * "footer") instead of adding an extra wrapping div around it.
 */
type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'footer';
  id?: string;
};

export function RevealOnScroll({ children, className, as: Tag = 'div', id }: RevealOnScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // `ref` is typed as HTMLElement to support any of the `as` tags, but
    // TS can't narrow a dynamic intrinsic tag's ref type from a shared
    // supertype — the runtime behavior is correct for every tag in the
    // union above, so this cast is safe.
    <Tag
      id={id}
      ref={ref as React.Ref<any>}
      className={cn(revealed ? 'animate-cascade-in' : 'reveal-pending', className)}
    >
      {children}
    </Tag>
  );
}
