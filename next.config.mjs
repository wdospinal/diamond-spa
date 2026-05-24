/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // lang-less paths → Spanish (permanent so Google treats /es/* as canonical)
      { source: '/services',  destination: '/es/services',  permanent: true },
      { source: '/about',     destination: '/es/about',     permanent: true },
      { source: '/location',  destination: '/es/location',  permanent: true },
      { source: '/book',      destination: '/es/book',      permanent: true },
      { source: '/history',   destination: '/es/history',   permanent: true },
    ]
  },

  async headers() {
    return [
      {
        // Immutable cache for all Next.js hashed static chunks (JS/CSS)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Long cache for public images
        source: '/:path*.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.jpg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  images: {
    // Serve responsive images in modern formats (WebP/AVIF)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Avoid PackFileCacheStrategy ENOENT on vendor-chunks like @vercel.js after rebuilds / stale .next
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig
