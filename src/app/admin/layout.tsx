import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "운영자 페이지 | Figmapedia",
  description: "디자이너의 AI 실험실 운영자 전용 페이지",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-6xl px-6 py-10 md:py-12">
        <header className="mb-6">
          <p className="text-xxs uppercase tracking-widest text-brand-blue-light">
            Admin
          </p>
          <h1 className="mt-1 text-h2 font-semibold text-fg-1 md:text-h1">
            운영자 페이지
          </h1>
        </header>
        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
