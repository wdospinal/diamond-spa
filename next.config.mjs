import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Turbopack config — Next.js 16 default bundler.
   *
   * resolve.alias: Next.js always bundles polyfill-module.js regardless of
   * browser targets. Because ALL our targets (Chrome 92+, FF 90+, Safari 15.4+)
   * natively support every polyfilled API, we replace the file with an empty
   * module. This eliminates the ~14 KiB "Legacy JavaScript" chunk PageSpeed
   * was flagging (Array.prototype.at, Object.hasOwn, trimStart/End, etc.).
   */
  turbopack: {
    resolve: {
      alias: {
        // Next.js loads polyfill-module via a relative require inside
        // next/dist/client/app-globals.js:
        //   require("../build/polyfills/polyfill-module")
        // Turbopack resolves that to the absolute path below.
        // Alias it to an empty module — all APIs are natively supported
        // by our browser targets (Chrome 92+, FF 90+, Safari 15.4+).
        [path.resolve(
          __dirname,
          'node_modules/next/dist/build/polyfills/polyfill-module.js'
        )]: path.resolve(__dirname, 'src/lib/empty-polyfills.js'),
      },
    },
  },

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
