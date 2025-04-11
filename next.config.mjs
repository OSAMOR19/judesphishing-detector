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
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

// Try to import user config if it exists
let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
  
  // Merge configs
  if (userConfig.default) {
    for (const key in userConfig.default) {
      if (
        typeof nextConfig[key] === 'object' &&
        !Array.isArray(nextConfig[key])
      ) {
        nextConfig[key] = {
          ...nextConfig[key],
          ...userConfig.default[key],
        }
      } else {
        nextConfig[key] = userConfig.default[key]
      }
    }
  }
} catch (e) {
  // ignore error
}

export default nextConfig
