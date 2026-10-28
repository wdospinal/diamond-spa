/** @type {import('next').NextConfig} */
const nextConfig = {
  // No anunciar el framework en cada respuesta (X-Powered-By: Next.js).
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.diamondspa.com.co' }],
        destination: 'https://diamondspa.com.co/:path*',
        permanent: true,
      },
      // `/` has no content of its own — the site lives under /es and /en. This was
      // an app/page.tsx calling permanentRedirect(), but Next 16.4 requires every
      // page to sit under a root layout and the only layouts are [lang] and admin.
      // Keep the destination in sync with DEFAULT_LOCALE (src/lib/constants/locale.ts).
      { source: '/', destination: '/es', permanent: true },
      { source: '/en/services/hidrafacial', destination: '/en/services/hydrafacial', permanent: true },
      { source: '/en/services/limpieza-facial-profunda', destination: '/en/services/deep-facial-cleanse', permanent: true },
      { source: '/en/services/limpieza-facial-basica', destination: '/en/services/basic-facial-cleanse', permanent: true },
      { source: '/en/services/hidratacion-facial', destination: '/en/services/facial-hydration', permanent: true },
      { source: '/en/services/limpieza-espalda', destination: '/en/services/back-cleanse', permanent: true },
      { source: '/en/services/depilacion-axila', destination: '/en/services/wax-underarm', permanent: true },
      { source: '/en/services/depilacion-bikini', destination: '/en/services/wax-bikini', permanent: true },
      { source: '/en/services/depilacion-media-pierna', destination: '/en/services/wax-half-leg', permanent: true },
      { source: '/en/services/depilacion-pierna-completa', destination: '/en/services/wax-full-leg', permanent: true },
      { source: '/en/services/depilacion-pecho', destination: '/en/services/wax-chest', permanent: true },
      { source: '/en/services/depilacion-espalda', destination: '/en/services/wax-back', permanent: true },
      { source: '/en/services/depilacion-zona-perianal', destination: '/en/services/wax-perianal', permanent: true },
      { source: '/en/services/depilacion-cuerpo-completo', destination: '/en/services/wax-full-body', permanent: true },
      { source: '/es/services/relaxing', destination: '/es/masajes/relajante', permanent: true },
      { source: '/en/services/relaxing', destination: '/en/masajes/relaxing', permanent: true },
      { source: '/es/services/deep-tissue', destination: '/es/masajes/deep-tissue', permanent: true },
      { source: '/en/services/deep-tissue', destination: '/en/masajes/deep-tissue', permanent: true },
      { source: '/es/services/four-hands', destination: '/es/masajes/4-manos', permanent: true },
      { source: '/en/services/four-hands', destination: '/en/masajes/four-hands', permanent: true },
      { source: '/es/services/duo', destination: '/es/masajes/duo', permanent: true },
      { source: '/en/services/duo', destination: '/en/masajes/duo', permanent: true },
      { source: '/es/services/hot-stones', destination: '/es/masajes/piedras-volcanicas', permanent: true },
      { source: '/en/services/hot-stones', destination: '/en/masajes/hot-stones', permanent: true },
      { source: '/es/services/sports', destination: '/es/masajes/deportivo', permanent: true },
      { source: '/en/services/sports', destination: '/en/masajes/sports', permanent: true },
      { source: '/es/services/sensitive', destination: '/es/masajes/sensitivo', permanent: true },
      { source: '/en/services/sensitive', destination: '/en/masajes/sensitive', permanent: true },
      { source: '/es/services/sensorial', destination: '/es/masajes/sensitivo', permanent: true },
      { source: '/en/services/sensorial', destination: '/en/masajes/sensitive', permanent: true },
      { source: '/es/massage-medellin', destination: '/es/masajes', permanent: true },
      // Special dates: the section and slugs are translated (src/lib/special-dates.ts),
      // so each locale's URL under the other locale's name goes to its own twin.
      { source: '/en/fechas-especiales', destination: '/en/special-dates', permanent: true },
      { source: '/es/special-dates', destination: '/es/fechas-especiales', permanent: true },
      { source: '/en/fechas-especiales/dia-del-hombre', destination: '/en/special-dates/mens-day', permanent: true },
      { source: '/en/fechas-especiales/navidad', destination: '/en/special-dates/christmas', permanent: true },
      { source: '/en/fechas-especiales/san-valentin', destination: '/en/special-dates/valentines-day', permanent: true },
      { source: '/en/fechas-especiales/dia-de-la-mujer', destination: '/en/special-dates/womens-day', permanent: true },
      { source: '/en/fechas-especiales/dia-de-la-madre', destination: '/en/special-dates/mothers-day', permanent: true },
      { source: '/en/fechas-especiales/dia-del-padre', destination: '/en/special-dates/fathers-day', permanent: true },
      { source: '/en/fechas-especiales/amor-y-amistad', destination: '/en/special-dates/love-and-friendship', permanent: true },
      { source: '/es/special-dates/mens-day', destination: '/es/fechas-especiales/dia-del-hombre', permanent: true },
      { source: '/es/special-dates/christmas', destination: '/es/fechas-especiales/navidad', permanent: true },
      { source: '/es/special-dates/valentines-day', destination: '/es/fechas-especiales/san-valentin', permanent: true },
      { source: '/es/special-dates/womens-day', destination: '/es/fechas-especiales/dia-de-la-mujer', permanent: true },
      { source: '/es/special-dates/mothers-day', destination: '/es/fechas-especiales/dia-de-la-madre', permanent: true },
      { source: '/es/special-dates/fathers-day', destination: '/es/fechas-especiales/dia-del-padre', permanent: true },
      { source: '/es/special-dates/love-and-friendship', destination: '/es/fechas-especiales/amor-y-amistad', permanent: true },
      { source: '/', destination: '/es', permanent: true },
      { source: '/services', destination: '/es/services', permanent: true },
      { source: '/about', destination: '/es/about', permanent: true },
      { source: '/location', destination: '/es/location', permanent: true },
      { source: '/book', destination: '/es/book', permanent: true },
      { source: '/history', destination: '/es/history', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          // Solo en producción: en desarrollo, con "immutable" el navegador seguía
          // mostrando el JavaScript viejo después de cada cambio.
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
            : []),
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
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
        source: '/:path*.woff2',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 75],
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
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
