'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { providerMonogram } from '@/lib/format';
import { RichText } from '@/components/shared/RichText';
import type { AssistantAnswer } from '@/lib/types';
import { CloseIcon, SendIcon, CheckIcon, ChevronRightIcon, ChevronDownIconCmp, SparkIcon } from '@/components/shared/icons';

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; answer: AssistantAnswer }
  | { id: string; role: 'assistant-error'; text: string };

const STARTER_CHIPS = ['What am I eligible for?', 'Closing this month', 'Compare two scholarships'];
const SCROLL_THRESHOLD_PX = 80;

type AssistantPanelProps = {
  // required props first
  isOpen: boolean;
  onClose: () => void;
  // optional props after
  firstName?: string | null;
};

/**
 * The Ask Bursa overlay. Deliberately simple in what it says — a short
 * summary, up to 3 quiet result rows, and one verification line per
 * answer, never a long paragraph — but polished in how it feels: real
 * message bubbles, a settling-in animation per message, a proper typing
 * indicator, and a scroll-to-latest affordance that only appears when
 * you've actually scrolled away from the bottom. All results come from
 * the deterministic /api/assistant route, which only ever returns real,
 * curated Bursa scholarships.
 */
export function AssistantPanel({ isOpen, onClose, firstName }: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [areChipsExpanded, setAreChipsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const nextId = useRef(0);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const DISMISS_THRESHOLD_PX = 96;

  // Drag-to-dismiss is bound only to the mobile-only handle bar below (not
  // the whole sheet), so it never fights the scrollable message list for
  // touch gestures. Desktop/tablet (sm+) doesn't render the handle at all.
  function handleDragStart(event: React.PointerEvent) {
    dragStartY.current = event.clientY;
    isDragging.current = true;
  }

  function handleDragMove(event: React.PointerEvent) {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    setDragY(Math.max(0, delta));
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    dragStartY.current = null;
    if (dragY > DISMISS_THRESHOLD_PX) {
      onClose();
    }
    setDragY(0);
  }

  function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    stickToBottomRef.current = true;
    setIsNearBottom(true);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < SCROLL_THRESHOLD_PX;
    stickToBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
  }

  function afterMessagesChange() {
    if (stickToBottomRef.current) {
      // Wait a frame so the new message has actually laid out before we
      // measure scrollHeight, or the scroll lands short.
      requestAnimationFrame(() => scrollToBottom());
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    // A window-level listener, not onKeyDown on the dialog, because
    // Escape must close the panel even if focus never left the page
    // behind it (no focus trap is implemented here).
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // Pin the page in place (not just overflow:hidden) so the background
    // can't be scrolled behind the panel via touch on iOS Safari, then
    // restore the exact scroll position on close — a plain overflow toggle
    // still lets elastic/touch scrolling move the fixed-underneath page.
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

  async function handleSend(rawText: string) {
    const text = rawText.trim();
    if (!text || isThinking) return;

    nextId.current += 1;
    stickToBottomRef.current = true;
    setMessages((prev) => [...prev, { id: `m${nextId.current}`, role: 'user', text }]);
    setInput('');
    setIsThinking(true);
    afterMessagesChange();

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();
      nextId.current += 1;

      if (json.ok) {
        setMessages((prev) => [...prev, { id: `m${nextId.current}`, role: 'assistant', answer: json.data }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `m${nextId.current}`, role: 'assistant-error', text: json.error?.message ?? "I couldn't find an answer just now." },
        ]);
      }
    } catch {
      nextId.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `m${nextId.current}`, role: 'assistant-error', text: "I couldn't reach Bursa just now. Please try again." },
      ]);
    } finally {
      setIsThinking(false);
      afterMessagesChange();
    }
  }

  return (
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
        role="dialog"
        aria-modal="true"
        aria-label="Ask Bursa"
        aria-hidden={!isOpen}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] max-h-[85dvh] flex-col rounded-t-3xl bg-surface-white shadow-lg transition-transform duration-300 motion-reduce:transition-none',
          'sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto sm:h-dvh sm:max-h-none sm:w-[420px] sm:translate-y-0 sm:rounded-none',
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'pointer-events-none translate-y-full sm:translate-x-full'
        )}
      >
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          style={{ touchAction: 'none' }}
          aria-hidden="true"
          className="flex h-20 shrink-0 items-center justify-center sm:hidden"
        >
          <span className="h-4 w-36 rounded-full bg-border-strong" />
        </div>

        <header className="select-none flex items-center justify-between gap-12 border-b border-border-faint px-16 py-12">
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-xl bg-ink-indigo text-marigold">
              <SparkIcon className="h-16 w-16" />
            </span>
            <span className="text-ink-indigo" style={{ font: 'var(--font-heading-h4)' }}>
              Ask Bursa
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ask Bursa"
            className="flex h-36 w-36 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo"
          >
            <CloseIcon className="h-20 w-20" />
          </button>
        </header>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} onScroll={handleScroll} className="flex flex-1 flex-col gap-16 overflow-y-auto px-16 py-16">
            <p className="select-none text-ink-muted-dark" style={{ font: 'var(--font-body-regular)' }}>
              Hi{firstName ? ` ${firstName}` : ''} 👋 Ask me to find, explain, or compare scholarships. I only surface
              real matches from Bursa.
            </p>

            {messages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}

            {isThinking && <ThinkingIndicator />}
          </div>

          {!isNearBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              aria-label="Scroll to latest message"
              className="animate-icon-pop absolute bottom-12 left-1/2 flex h-36 w-36 -translate-x-1/2 items-center justify-center rounded-full bg-ink-indigo text-inverse shadow-lg transition hover:bg-ink-indigo-light"
            >
              <ChevronDownIconCmp className="h-18 w-18" />
            </button>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend(input);
          }}
          className="border-t border-border-faint px-16 pt-12"
          style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
        >
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setAreChipsExpanded((value) => !value)}
              aria-expanded={areChipsExpanded}
              className="mb-8 select-none text-ink-muted underline transition hover:text-ink-indigo"
              style={{ font: 'var(--font-caption)' }}
            >
              {areChipsExpanded ? 'Hide suggestions' : 'Suggestions'}
            </button>
          )}
          {(messages.length === 0 || areChipsExpanded) && (
            <div className="flex flex-wrap gap-8 pb-12">
              {STARTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-border px-12 py-6 text-ink-indigo transition hover:bg-surface-warm-light disabled:pointer-events-none disabled:opacity-40"
                  style={{ font: 'var(--font-body-small)' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-8">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a scholarship…"
              aria-label="Ask Bursa"
              className="h-44 flex-1 rounded-xl border border-border bg-surface-white px-16 text-ink-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo"
              style={{ font: 'var(--font-body-regular)' }}
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || isThinking}
              className="flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-ink-indigo text-inverse transition disabled:opacity-40"
            >
              <SendIcon className="h-18 w-18" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="animate-message-in flex justify-end">
        <p
          className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink-indigo px-16 py-10 text-inverse"
          style={{ font: 'var(--font-body-regular)' }}
        >
          {message.text}
        </p>
      </div>
    );
  }

  if (message.role === 'assistant-error') {
    return (
      <div className="animate-message-in flex items-start gap-8">
        <AssistantAvatar />
        <p role="alert" className="pt-4 text-danger" style={{ font: 'var(--font-body-regular)' }}>
          {message.text}
        </p>
      </div>
    );
  }

  const { answer } = message;
  return (
    <div className="animate-message-in flex items-start gap-8">
      <AssistantAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-8 pt-4">
        <RichText text={answer.summary} className="text-ink-indigo" />
        {answer.results.map((result) => (
          <Link
            key={result.id}
            href={`/scholarships/${result.slug}`}
            className="relative z-10 flex select-none items-center gap-12 rounded-2xl border border-border px-12 py-10 transition hover:bg-surface-warm-light active:bg-surface-warm-light"
          >
            <span
              className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-ink-indigo/10 text-ink-indigo"
              style={{ font: 'var(--font-caption)' }}
            >
              {providerMonogram(result.provider)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-ink-indigo" style={{ font: 'var(--font-button-label)' }}>
                {result.title}
              </span>
              <span className="block truncate text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
                {result.meta}
              </span>
            </span>
            <ChevronRightIcon className="h-16 w-16 shrink-0 text-ink-muted" />
          </Link>
        ))}
        {answer.verified && (
          <p className="flex items-center gap-4 text-ink-muted" style={{ font: 'var(--font-caption)' }}>
            <CheckIcon className="h-14 w-14" />
            From your verified Bursa matches
          </p>
        )}
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-ink-indigo text-marigold"
    >
      <SparkIcon className="h-12 w-12" />
    </span>
  );
}

function ThinkingIndicator() {
  return (
    <div className="animate-message-in flex items-center gap-8" role="status" aria-label="Ask Bursa is thinking">
      <AssistantAvatar />
      <div className="flex items-center gap-4 rounded-2xl rounded-bl-sm bg-surface-warm-light px-14 py-10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-8 w-8 animate-bounce rounded-full bg-ink-muted motion-reduce:animate-none"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
