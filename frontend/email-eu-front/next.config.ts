import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better error handling
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables that will be available in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
};

export default nextConfig;
