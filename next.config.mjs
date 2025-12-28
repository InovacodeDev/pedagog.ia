import withSerwistInit from '@serwist/next';

const isDev = process.env.NODE_ENV === 'development';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: isDev, // Disable service worker in development to prevent infinite HMR loop
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Suppress the big string serialization warning in development
      config.infrastructureLogging = {
        ...config.infrastructureLogging,
        level: 'error',
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://www.google-analytics.com; frame-src 'none'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
