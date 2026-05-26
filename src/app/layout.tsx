import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { SideRail } from "@/components/layout/SideRail";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { GlobalSearchOverlay } from "@/components/search/GlobalSearchOverlay";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Agentation } from "agentation";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://figmapedia.com"
).trim();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Figmapedia - 디자인 용어사전 & 리소스",
    template: "%s | 피그마 가이드 - Figmapedia",
  },
  description:
    "피그마(Figma) 디자인 용어사전, UI/UX 리소스, 아티클을 검색하세요. 한국어로 정리된 피그마 사용법, 디자인 시스템, 프로토타입 가이드.",
  keywords: [
    "피그마",
    "Figma",
    "디자인 용어",
    "디자인 사전",
    "UI 디자인",
    "UX 디자인",
    "피그마 사용법",
    "디자인 리소스",
    "피그마 단축키",
    "디자인 시스템",
    "프로토타입",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Figmapedia - 디자인 용어사전 & 리소스",
    description:
      "피그마(Figma) 디자인 용어사전, UI/UX 리소스, 아티클을 검색하세요.",
    url: SITE_URL,
    siteName: "Figmapedia",
    type: "website",
    locale: "ko_KR",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Figmapedia" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Figmapedia - 디자인 용어사전 & 리소스",
    description:
      "피그마(Figma) 디자인 용어사전, UI/UX 리소스, 아티클을 검색하세요.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "itQSqt8mb56aUgnHLQozl7K0Sydr2-p0zozUqZE3hiw",
    other: {
      "naver-site-verification": ["67e11a1d64f436a367a098073032fe4433dc5ce7"],
    },
  },
  other: {
    "geo.region": "KR",
    "geo.placename": "Seoul",
    "content-language": "ko",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BN35R5EHNE"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BN35R5EHNE');`}
        </Script>
      </head>
      <body
        className={`${pretendard.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased min-h-screen bg-bg-base text-fg-1`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "Figmapedia",
                  url: SITE_URL,
                  description: "피그마(Figma) 디자인 도구 한국어 지식 베이스",
                  inLanguage: "ko",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  name: "Figmapedia",
                  url: SITE_URL,
                },
              ],
            }),
          }}
        />
        <ClientProviders>
          <div className="xl-nav:pl-19 min-h-screen">
            <SideRail />
            <div className="flex flex-col min-w-0">
              <Navbar />
              <GlobalSearchOverlay />
              <main className="flex-1">{children}</main>
              <FooterWrapper />
            </div>
          </div>
          <FloatingButton />
        </ClientProviders>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
