import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bursa — Find scholarships worth applying for',
  description:
    'Search scholarships by study level, field, destination, and funding. See your eligibility, compare your options, and apply through the official source.',
};

/**
 * Deliberately shell-less. Bursa has two distinct interface shells — the
 * public marketing site and the authenticated web app — each with its own
 * layout group (`(marketing)`, `(auth)`, `(app)`). Nothing about "header"
 * or "footer" belongs here; adding either back would make every route
 * inherit marketing or app chrome it shouldn't.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${GeistMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-16 focus:top-16 focus:z-50 focus:rounded-full focus:bg-ink-indigo focus:px-16 focus:py-8 focus:text-inverse"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
