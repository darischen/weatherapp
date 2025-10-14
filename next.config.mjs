/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tile.openstreetmap.org' }
    ]
  },
  experimental: {
    reactCompiler: false
  }
};
export default nextConfig;