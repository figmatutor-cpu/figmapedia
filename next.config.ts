import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // 기존 Oopy 섹션 페이지 → 새 페이지 (구체적 규칙 우선)
      { source: "/a369375c-dc3d-42db-9a46-5e0302edc47f", destination: "/", permanent: true },
      { source: "/8bafe54c-8437-4ced-80a8-5f4a8720b9fb", destination: "/figma-info", permanent: true },
      { source: "/ddc8b180-7f6c-439a-ac53-3f51868d34db", destination: "/figma-info", permanent: true },
      { source: "/ddca3680-a5b1-4464-9490-54acaa23e757", destination: "/figma-info", permanent: true },
      { source: "/287fdea8-0034-80fd-bbb0-dd6cb6aef377", destination: "/prompt-pedia", permanent: true },
      { source: "/138d9629-23c0-4714-8f85-334459331f02", destination: "/kiosk-food", permanent: true },
      { source: "/17991413-9ac0-476a-8405-ae14eacc31ff", destination: "/uxui-study", permanent: true },
      { source: "/f3eab373-ff92-4bb8-8e99-6a89c8373f60", destination: "/uxui-study", permanent: true },
      { source: "/7c751f06-80b9-4a72-b769-b1d20a843691", destination: "/uxui-study", permanent: true },
      { source: "/3fe4b917-e6fb-4f0d-8e25-32fcf30c56c1", destination: "/figma-info", permanent: true },
      { source: "/bc95f6b0-0075-48bb-bbaa-311b6750098d", destination: "/community/312baef6-290e-4457-bdad-00ed832aebbe", permanent: true },
      { source: "/460d8222-37f2-47b5-b147-c0987cc79a4b", destination: "/figma-info", permanent: true },
      { source: "/2cafdea8-0034-803a-a1b6-f3a6a1f178bf", destination: "/", permanent: true },
      // 범용 UUID → entry 페이지
      {
        source: "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        destination: "/entry/:id",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.notion.so" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
