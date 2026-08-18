type LogoMarkProps = {
  // optional props after
  className?: string;
};

/**
 * The icon-only crop of the real Bursa mark (public/logo/desktop.svg) — the
 * same vector paths, just without the "ursa" wordmark, for contexts too
 * narrow for the full lockup (the nav rail).
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="4" y="6" width="14" height="36" rx="2" fill="#1B1B3A" />
      <path d="M22 6H36C40.4183 6 44 9.58172 44 14V15C44 19.4183 40.4183 23 36 23H22V6Z" fill="#1B1B3A" />
      <path d="M39.5 14.25L37 11.75L34.5 14.25" stroke="#F6B23C" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 25H36C40.4183 25 44 28.5817 44 33V34C44 38.4183 40.4183 42 36 42H22V25Z" fill="#1B1B3A" />
      <path d="M39.5 36.25L37 33.75L34.5 36.25" stroke="#F6B23C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
