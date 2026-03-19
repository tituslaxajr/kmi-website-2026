import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push({
      apply(compiler: any) {
        compiler.hooks.normalModuleFactory.tap('FigmaAssetPlugin', (factory: any) => {
          factory.hooks.beforeResolve.tap('FigmaAssetPlugin', (resolveData: any) => {
            if (resolveData?.request?.startsWith('figma:asset/')) {
              resolveData.request = require.resolve('./src/app/lib/figma-asset-stub.ts')
            }
          })
        })
      }
    })
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
