import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});
const title = "피그마 튜터 | 워크플로우 교육·컨설팅";
const description = "디자이너와 IT 팀의 워크플로우를 효율화하는 교육·컨설팅. AI 활용, 디자인 시스템, 직군 간 협업을 실제 업무에 연결합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://figmatutor.info"),
  title,
  description,
  alternates: { canonical: "https://figmatutor.info/" },
  openGraph: { title, description, url: "https://figmatutor.info/", siteName: "Figmatutor", locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={pretendard.variable}>{children}</body></html>;
}
