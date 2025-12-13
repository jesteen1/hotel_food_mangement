
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Vercel optimization
  output: 'standalone',
  // Silence Turbopack warning
  turbopack: {
    // Empty config
  }
};

export default nextConfig;
