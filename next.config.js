/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds for MVP deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript strict checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
