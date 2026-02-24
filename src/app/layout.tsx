import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { GlobalSearchOverlay } from "@/components/search/GlobalSearchOverlay";
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Figmapedia - 디자인 용어사전 & 리소스",
  description:
    "디자인 용어, 리소스, 아티클을 검색하세요. Figma와 디자인 시스템에 대한 지식 베이스.",
  openGraph: {
    title: "Figmapedia - 디자인 용어사전 & 리소스",
    description: "디자인 용어, 리소스, 아티클을 검색하세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${pretendard.variable} ${geistMono.variable} antialiased min-h-screen bg-bg-base text-gray-100`}
      >
        <ClientProviders>
          <Navbar />
          <GlobalSearchOverlay />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
