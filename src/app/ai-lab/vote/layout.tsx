import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이번 주 실험 주제 투표 | AI 실험실 | Figmapedia",
  description:
    "디자이너의 AI 실험실에서 매주 실험할 주제를 함께 결정하세요. 무료 회원도 투표에 참여할 수 있습니다.",
  openGraph: {
    title: "이번 주 실험 주제 투표 | 디자이너의 AI 실험실",
    description:
      "투표하고, 실험하고, 공유하고, 발표하는 순환 커뮤니티의 첫 단계.",
    type: "website",
  },
};

export default function VoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
