import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Cloudflare Pages: Edge Runtime ──
  // Use 'edge' for Cloudflare Workers / Pages Functions
  // Comment out for Node.js deployment
  // experimental: { runtime: 'edge' },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Supabase env vars available to client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  },

  // Headers: security + CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirect /admin → /admin/dashboard etc.
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/user',
        destination: '/user/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
