import Link from "next/link";
import { ArchiveBrowser } from "@/components/ai-lab/archive/ArchiveBrowser";
import { getAllExperiments } from "@/lib/mdx/experiments";

export const revalidate = 600;

export default async function ArchivePage() {
  const experiments = await getAllExperiments();
  const totalCount = experiments.length;
  const toolCount = new Set(experiments.map((e) => e.tool)).size;

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/ai-lab" className="transition hover:text-fg-2">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">아카이브</span>
        </nav>

        <header className="mb-10 max-w-2xl">
          <p className="mb-2 text-xxs uppercase tracking-widest text-brand-blue-light">
            Archive
          </p>
          <h1 className="text-h1 font-semibold text-fg-1 md:text-display">
            실험 아카이브
          </h1>
          <p className="mt-3 text-body text-fg-3 md:text-body-lg">
            지금까지 진행된 모든 AI 실험 리포트를 검색하고 도구·주제별로
            탐색하세요. 전체 본문은 멤버 전용입니다.
          </p>
          <div className="mt-4 flex items-center gap-3 text-meta text-fg-4">
            <span>총 {totalCount}건</span>
            <span aria-hidden>·</span>
            <span>{toolCount}개 도구</span>
          </div>
        </header>

        {totalCount === 0 ? (
          <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-12 text-center">
            <p className="text-body text-fg-3">
              아직 등록된 실험 리포트가 없습니다.
            </p>
          </div>
        ) : (
          <ArchiveBrowser experiments={experiments} />
        )}
      </div>
    </main>
  );
}
