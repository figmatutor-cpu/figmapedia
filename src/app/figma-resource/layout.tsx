import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "피그마 리소스 | Figmapedia",
  description:
    "피그마 디자인 리소스 모음 — 템플릿, 튜토리얼, 프로토타이핑 예제를 한곳에서 확인하세요.",
  alternates: { canonical: "/figma-resource" },
  openGraph: {
    title: "피그마 리소스 | Figmapedia",
    description:
      "피그마 디자인 리소스 모음 — 템플릿, 튜토리얼, 프로토타이핑 예제를 한곳에서 확인하세요.",
    type: "website",
  },
};

export default function FigmaResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
