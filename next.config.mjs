/** @type {import('next').NextConfig} */
const nextConfig = {

  async redirects() {
    return [
      // www → non-www (permanent 308 so Google consolidates to diamondspa.com.co)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.diamondspa.com.co' }],
        destination: 'https://diamondspa.com.co/:path*',
        permanent: true,
      },
      // Old English service URLs with Spanish slugs → English slugs (308 permanent)
      { source: '/en/services/hidrafacial',           destination: '/en/services/hydrafacial',         permanent: true },
      { source: '/en/services/limpieza-facial-profunda', destination: '/en/services/deep-facial-cleanse', permanent: true },
      { source: '/en/services/limpieza-facial-basica',   destination: '/en/services/basic-facial-cleanse', permanent: true },
      { source: '/en/services/hidratacion-facial',    destination: '/en/services/facial-hydration',    permanent: true },
      { source: '/en/services/limpieza-espalda',      destination: '/en/services/back-cleanse',        permanent: true },
      { source: '/en/services/depilacion-axila',      destination: '/en/services/wax-underarm',        permanent: true },
      { source: '/en/services/depilacion-bikini',     destination: '/en/services/wax-bikini',          permanent: true },
      { source: '/en/services/depilacion-media-pierna', destination: '/en/services/wax-half-leg',      permanent: true },
      { source: '/en/services/depilacion-pierna-completa', destination: '/en/services/wax-full-leg',   permanent: true },
      { source: '/en/services/depilacion-pecho',      destination: '/en/services/wax-chest',           permanent: true },
      { source: '/en/services/depilacion-espalda',    destination: '/en/services/wax-back',            permanent: true },
      { source: '/en/services/depilacion-zona-perianal', destination: '/en/services/wax-perianal',     permanent: true },
      { source: '/en/services/depilacion-cuerpo-completo', destination: '/en/services/wax-full-body',  permanent: true },
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
        // Long cache for public images (AVIF + WebP fallbacks)
        source: '/:path*.avif',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
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
      {
        // Self-hosted icon font — version is baked into the filename, safe to cache forever
        source: '/:path*.woff2',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  images: {
    /**
     * AVIF browser-support detection — how it works:
     *
     * When a browser requests an image through /_next/image, it sends an
     * Accept header, e.g.:  Accept: image/avif,image/webp,image/*
     *
     * Next.js reads that header and serves the best format the browser supports:
     *   - AVIF  → Chrome 85+, Firefox 93+, Safari 16+  (≈96 % of users, 2025)
     *   - WebP  → all modern browsers that don't yet support AVIF
     *   - JPEG  → legacy fallback (IE, very old Safari)
     *
     * The converted image is cached on Vercel's CDN edge, so the transcode
     * only happens once per (image × width × format) triple.
     *
     * Local source files are now .avif (avg. 67 % smaller than the old .webp
     * sources).  For AVIF-capable browsers the pipeline is:
     *   read AVIF source → resize → serve AVIF  (no format conversion)
     * For WebP-only browsers:
     *   read AVIF source → resize + transcode → serve WebP  (cached)
     */
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
      {
        // Dicebear avatar API — used for static review author photos
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
