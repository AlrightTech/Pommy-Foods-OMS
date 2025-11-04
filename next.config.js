/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize for production
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  typescript: {
    // Allow build to continue with type errors in NextAuth (beta version has type issues)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow build to continue with ESLint warnings
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

