import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Recommended settings for Vercel deployment
  output: "standalone",
  // Enable static optimization where possible
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
