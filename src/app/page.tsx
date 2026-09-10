"use client";

import { useEffect } from "react";
import { HeroSearch } from "@/components/search/HeroSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchContext } from "@/components/search/SearchProvider";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import { WorkflowHome } from "@/components/home/WorkflowHome";

export default function HomePage() {
  const { hasSearched, clearSearch } = useSearchContext();

  useEffect(() => {
    if (hasSearched) window.scrollTo({ top: 0, behavior: "instant" });
  }, [hasSearched]);

  return (
    <main id="main-content">
      {hasSearched ? (
        <section className="min-h-screen bg-bg-base pt-32 pb-36">
          <div className="mx-auto max-w-4xl px-4">
            <button onClick={clearSearch} className="mb-6 min-h-11 text-sm text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4">← 홈으로 돌아가기</button>
            <h1 className="mb-6 text-2xl font-semibold">실무 자료 검색 결과</h1>
            <SponsorBanner />
            <SearchResults />
          </div>
          <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 px-4"><HeroSearch /></div>
        </section>
      ) : <WorkflowHome />}
    </main>
  );
}
