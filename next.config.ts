import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.notion.so" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "s3-figma-hubfile-images-production.figma.com" },
    ],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
