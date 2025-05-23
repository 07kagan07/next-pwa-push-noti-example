import withPWA from '@ducanh2912/next-pwa'

const config = {
  reactStrictMode: true,
}

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' ? false : false,
  sw: '/sw.js',
  publicExcludes: ['!sw.js']
})(config)

export default nextConfig
