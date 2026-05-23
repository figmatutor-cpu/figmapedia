import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 실험실 | Figmapedia",
  description:
    "매주 새로운 AI 도구를 함께 실험하고 결과를 공유하는 디자이너 커뮤니티. 투표하고, 실험하고, 공유하고, 발표하세요.",
  openGraph: {
    title: "디자이너의 AI 실험실 | Figmapedia",
    description:
      "투표하고, 실험하고, 공유하고, 발표하는 순환 커뮤니티. 매주 새로운 AI 도구를 디자이너의 언어로 실험합니다.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "디자이너의 AI 실험실",
    description: "투표하고, 실험하고, 공유하고, 발표하는 순환 커뮤니티",
  },
};

export default function AiLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
