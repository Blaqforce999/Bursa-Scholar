import type { NextConfig } from 'next';

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
