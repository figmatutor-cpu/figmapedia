"use client";

import dynamic from "next/dynamic";
import { HeroSearch } from "@/components/search/HeroSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchContext } from "@/components/search/SearchProvider";

const HeroWave = dynamic(
  () =>
    import("@/components/hero/HeroWave").then((m) => ({
      default: m.HeroWave,
    })),
  { ssr: false }
);

export default function HomePage() {
  const { hasSearched } = useSearchContext();

  return (
    <main className="bg-[#050510]">
      {/* Hero background — hidden during search */}
      {!hasSearched && (
        <div className="fixed inset-0 overflow-hidden">
          <HeroWave />
        </div>
      )}

      {/* Search results */}
      {hasSearched && (
        <section className="min-h-screen bg-[#050510] pt-28 pb-32">
          <div className="mx-auto max-w-4xl px-4">
            <SearchResults />
          </div>
        </section>
      )}

      {/* Single persistent search — never unmounts, position changes via CSS */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-full px-4 ${
          hasSearched
            ? "bottom-6 max-w-3xl"
            : "top-1/2 -translate-y-1/2 max-w-[600px]"
        }`}
      >
        {/* Hero text — only visible in hero mode */}
        {!hasSearched && (
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl sm:text-4xl font-semibold tracking-tight drop-shadow-[0_1px_8px_rgba(31,61,188,0.25)] leading-snug">
              AI로 검색해도 잘 나오지 않는
              <br />
              실무 디자인 정보를 확인하세요.
            </h1>
            <p className="text-gray-300/90 mt-3 sm:mt-4 text-sm sm:text-base">
              키워드로 가볍게 검색 하실 수 있어요.
            </p>
          </div>
        )}
        <HeroSearch />
      </div>
    </main>
  );
}
