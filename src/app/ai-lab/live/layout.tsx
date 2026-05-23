import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "라이브 세션 | AI 실험실 | Figmapedia",
  description:
    "매주 일요일 저녁, YouTube Live로 진행되는 AI 실험실 라이브 세션. 라이브는 무료, 다시보기는 멤버 전용입니다.",
  openGraph: {
    title: "라이브 세션 | 디자이너의 AI 실험실",
    description: "매주 일요일 저녁 YouTube Live. 다시보기는 멤버 전용 (VOD).",
    type: "website",
  },
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
