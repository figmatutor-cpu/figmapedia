import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.notion.so" },
    ],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
