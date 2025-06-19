/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hackinsportswear.co.uk'],
    unoptimized: true, // This will prevent Next.js from optimizing local images
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 