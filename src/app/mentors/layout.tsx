import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "멘토 | Figmapedia",
  description:
    "디자이너의 AI 실험실 멘토를 만나보세요. 1:1 멘토링, 워크샵, 스터디 그룹을 제공합니다.",
  openGraph: {
    title: "멘토 | 디자이너의 AI 실험실",
    description:
      "검증된 시니어 디자이너에게 1:1 피드백과 커리어 조언을 받으세요.",
    type: "website",
  },
};

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
