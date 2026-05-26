import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실험 아카이브 | AI 실험실 | Figmapedia",
  description:
    "지금까지 진행된 모든 AI 실험 리포트를 검색하고 도구·주제별로 탐색하세요.",
  openGraph: {
    title: "실험 아카이브 | 디자이너의 AI 실험실",
    description:
      "Claude, Cursor, Figma AI, Midjourney 등 매주 진행된 AI 실험 결과를 한 곳에서.",
    type: "website",
  },
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
