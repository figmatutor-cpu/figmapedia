import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "스터디 공간 | 멤버 전용 | Figmapedia",
  description:
    "디자이너의 AI 실험실 멤버를 위한 오프라인 스터디 공간 예약 페이지",
  robots: { index: false, follow: false },
};

export default function StudyRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
