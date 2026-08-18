'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { CloseIcon } from '@/components/shared/icons';

const SWIPE_DISMISS_THRESHOLD_PX = 96;

const noopSubscribe = () => () => {};

/** Renders true only once mounted on the client — the portal target
 *  (`document.body`) doesn't exist during server rendering. */
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

type ModalProps = {
  // required props first
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  // optional props after
  /** Merged onto the panel — mainly for a caller-specific md:max-w-[...]. */
  className?: string;
  showCloseButton?: boolean;
};

/**
 * The one shared modal/dialog shell: a bottom sheet on mobile (drag handle,
 * swipe down or scrim tap to dismiss, dvh + safe-area aware) and a centered
 * dialog on desktop (Esc, backdrop click, or the X). Callers own their own
 * content and title layout — HelpModal's scrollable FAQ list and
 * ScholarshipAuthModal's centered single-action prompt look nothing alike,
 * but both get the exact same dismiss mechanics and shell chrome from here.
 */
export function Modal({ isOpen, onClose, ariaLabel, children, className, showCloseButton = true }: ModalProps) {
  const isMounted = useIsMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

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

  function handleDragStart(event: React.PointerEvent) {
    dragStartY.current = event.clientY;
    isDragging.current = true;
  }

  function handleDragMove(event: React.PointerEvent) {
    if (!isDragging.current || dragStartY.current === null) return;
    setDragY(Math.max(0, event.clientY - dragStartY.current));
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY > SWIPE_DISMISS_THRESHOLD_PX) onClose();
    setDragY(0);
  }

  if (!isMounted) return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-ink-indigo/40 transition-opacity duration-200 motion-reduce:transition-none',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-16',
          !isOpen && 'pointer-events-none'
        )}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-hidden={!isOpen}
          style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
          className={cn(
            'relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-surface-white shadow-lg transition-all duration-300 motion-reduce:transition-none',
            'md:max-w-[480px] md:rounded-2xl',
            isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0 md:translate-y-4',
            className
          )}
        >
          <div
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            style={{ touchAction: 'none' }}
            aria-hidden="true"
            className="flex h-20 shrink-0 items-center justify-center md:hidden"
          >
            <span className="h-4 w-36 rounded-full bg-border-strong" />
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-12 top-12 z-10 flex h-36 w-36 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo md:right-16 md:top-16"
            >
              <CloseIcon className="h-18 w-18" />
            </button>
          )}

          <div
            className="flex-1 overflow-y-auto px-24 pb-24 pt-8 md:pt-24"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
