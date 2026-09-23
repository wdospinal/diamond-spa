/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.diamondspa.com.co' }],
        destination: 'https://diamondspa.com.co/:path*',
        permanent: true,
      },
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
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
