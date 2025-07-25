/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Développement local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      // Production - votre domaine
      {
        protocol: 'https',
        hostname: 'bioqrsuivi.com',
        pathname: '/uploads/**',
      },
      // Si votre API est sur un sous-domaine
      {
        protocol: 'https',
        hostname: 'api.bioqrsuivi.com',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
