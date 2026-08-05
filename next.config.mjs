/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdnjs.cloudflare.com'],
  },
  // Suppress Leaflet SSR warnings
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
    return config
  },
}

export default nextConfig
