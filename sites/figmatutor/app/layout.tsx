import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});
const title = "피그마튜터 하이서 ㅣ 디자이너와 IT팀을 위한 AI&Figma 실무 맞춤 교육";
const description = "피그마튜터 하이서의 디자이너와 IT팀을 위한 AI&Figma 실무 맞춤 교육. 교육 후 바로 적용할 수 있는 워크플로우 효율화, 업무 자동화, 디자인 시스템 교육과 컨설팅을 제공합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://figmatutor.info"),
  title,
  description,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  alternates: { canonical: "https://figmatutor.info/" },
  openGraph: { title, description, url: "https://figmatutor.info/", siteName: "Highstand", locale: "ko_KR", type: "website", images: [{ url: "/og-highstand.png", width: 1200, height: 630, alt: "HighStand — 디자이너와 IT 팀을 위한 실무 맞춤 교육" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-highstand.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={pretendard.variable}>{children}</body></html>;
}
