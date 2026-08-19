import type { NextConfig } from 'next';

// script-src/style-src need 'unsafe-inline' because Next's own RSC hydration
// payload ships as an inline <script>, and this app's design system relies
// on inline style={{...}} attributes throughout, not just Tailwind classes.
// No middleware/nonce infrastructure exists to tighten this further today;
// everything else below is a real, unrelaxed restriction.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  // /login and /signup were separate pages; both are now the single /auth
  // route with a mode. Kept as redirects, not pages, for anything that
  // still links to the old paths (bookmarks, browser history).
  async redirects() {
    return [
      { source: '/login', destination: '/auth?mode=login', permanent: false },
      { source: '/signup', destination: '/auth?mode=signup', permanent: false },
    ];
  },
};

export default nextConfig;
