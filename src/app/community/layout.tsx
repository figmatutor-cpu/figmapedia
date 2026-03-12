import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "피그마 사용자들이 자유롭게 질문하고 정보를 공유하는 커뮤니티입니다.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "커뮤니티 | Figmapedia",
    description:
      "피그마 사용자들이 자유롭게 질문하고 정보를 공유하는 커뮤니티입니다.",
    type: "website",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
