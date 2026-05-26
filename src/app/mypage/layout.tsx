import type { Metadata } from "next";
import { MyPageNav } from "@/components/mypage/MyPageNav";

export const metadata: Metadata = {
  title: "마이페이지 | Figmapedia",
  description: "내 구독, 활동 이력, 뱃지를 확인하세요.",
  robots: { index: false, follow: false },
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-5xl px-6 py-10 md:py-12">
        <header className="mb-6">
          <p className="text-xxs uppercase tracking-widest text-brand-blue-light">
            My Page
          </p>
          <h1 className="mt-1 text-h2 font-semibold text-fg-1 md:text-h1">
            마이페이지
          </h1>
        </header>
        <MyPageNav />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
