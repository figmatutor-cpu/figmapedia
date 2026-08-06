import type { Metadata } from "next";

const DESCRIPTION =
  "격주로 발행되는 허들링 클럽 AI 뉴스레터 아카이브입니다. 지난 호를 모두 다시 읽어보세요.";

export const metadata: Metadata = {
  title: "AI 리포트",
  description: DESCRIPTION,
  alternates: { canonical: "/ai-report" },
  openGraph: {
    title: "AI 리포트 | HuddlingClub",
    description: DESCRIPTION,
    type: "website",
  },
};

export default function AiReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
