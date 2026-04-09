/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
