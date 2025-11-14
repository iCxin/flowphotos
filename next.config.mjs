/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['p.cxin.net'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  output: 'standalone',
}

export default nextConfig
