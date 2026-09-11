import type { Metadata } from "next";
import { educationTitle, educationDescription } from "@/components/home/education-content";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});
const title = `${educationTitle} | 피그마튜터 하이서`;
const description = educationDescription;

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
