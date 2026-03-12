import { spawnSync } from 'node:child_process';
import withSerwistInit from '@serwist/next';

const isDev = process.env.NODE_ENV === 'development';

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: isDev,
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
  async rewrites() {
    return [
      {
        // Proxy Amplitude Analytics to avoid CORS on localhost and ad-blockers
        source: '/api/amplitude-analytics/:path*',
        destination: 'https://api.amplitude.com/:path*',
      },
      {
        // Proxy Amplitude Session Replay
        source: '/api/amplitude-replay/:path*',
        destination: 'https://api-session-replay.amplitude.com/:path*',
      },
    ];
  },
};

export default withSerwist(nextConfig);
