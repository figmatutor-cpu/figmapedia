"use client";

import { useRouter } from "next/navigation";

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, children }: PolicyLayoutProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg-base pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-fg-3 hover:text-fg-1 transition-colors mb-8"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M12.5 15l-5-5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-body">뒤로가기</span>
        </button>

        {/* 제목 */}
        <h1 className="text-fg-1 text-h2 sm:text-h1 font-bold mb-10">
          {title}
        </h1>

        {/* 본문 */}
        <div className="text-fg-2 text-body sm:text-body-lg leading-relaxed space-y-8">
          {children}
        </div>
      </div>
    </main>
  );
}
