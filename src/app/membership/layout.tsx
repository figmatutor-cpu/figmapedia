import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "멤버십 | 디자이너의 AI 실험실 | Figmapedia",
  description:
    "월 5,900원으로 실험 리포트, 라이브 다시보기, 오프라인 스터디 공간을 모두 이용하세요.",
  openGraph: {
    title: "멤버십 | 디자이너의 AI 실험실",
    description:
      "월 5,900원 단일 요금제. 실험 리포트 + VOD + 스터디 공간 + Discord 커뮤니티.",
    type: "website",
  },
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
