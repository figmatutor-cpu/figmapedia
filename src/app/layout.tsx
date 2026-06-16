import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { GlobalSearchOverlay } from "@/components/search/GlobalSearchOverlay";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { FloatingButton } from "@/components/ui/FloatingButton";
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

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://huddling.ai").trim();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HuddlingClub",
    template: "%s | HuddlingClub",
  },
  description: "AI 시대의 불안감, 행동으로 함께 이겨냅니다.",
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
    title: "HuddlingClub",
    description: "AI 시대의 불안감, 행동으로 함께 이겨냅니다.",
    url: SITE_URL,
    siteName: "HuddlingClub",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "HuddlingClub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HuddlingClub",
    description: "AI 시대의 불안감, 행동으로 함께 이겨냅니다.",
    images: ["/og-image.png?v=2"],
  },
  verification: {
    google: "itQSqt8mb56aUgnHLQozl7K0Sydr2-p0zozUqZE3hiw",
    other: { "naver-site-verification": ["67e11a1d64f436a367a098073032fe4433dc5ce7"] },
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-BN35R5EHNE" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BN35R5EHNE');`}
        </Script>
      </head>
      <body
        className={`${pretendard.variable} ${geistMono.variable} antialiased min-h-screen bg-bg-base text-gray-100`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "HuddlingClub",
                  url: SITE_URL,
                  description: "AI 시대의 불안감, 행동으로 함께 이겨냅니다.",
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
                  name: "HuddlingClub",
                  url: SITE_URL,
                },
              ],
            }),
          }}
        />
        <ClientProviders>
          <Navbar />
          <GlobalSearchOverlay />
          {children}
          <FooterWrapper />
          <FloatingButton />
        </ClientProviders>
      </body>
    </html>
  );
}
