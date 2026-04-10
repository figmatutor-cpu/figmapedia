"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HeroSearch } from "@/components/search/HeroSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchContext } from "@/components/search/SearchProvider";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import { HomeSections } from "@/components/hero/HomeSections";

const HeroWave = dynamic(
  () =>
    import("@/components/hero/HeroWave").then((m) => ({
      default: m.HeroWave,
    })),
  { ssr: false }
);

export default function HomePage() {
  const { hasSearched } = useSearchContext();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (hasSearched) {
      setIsScrolled(false);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.3);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasSearched]);

  const searchAtBottom = hasSearched || isScrolled;

  return (
    <main className="bg-bg-base">
      {/* Hero background — faded when scrolled, hidden during search */}
      {!hasSearched && (
        <div
          className={`fixed inset-0 overflow-hidden transition-opacity duration-300 ${
            isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <HeroWave />
        </div>
      )}

      {/* Search results */}
      {hasSearched && (
        <section className="min-h-screen bg-bg-base pt-28 pb-32">
          <div className="mx-auto max-w-4xl px-4">
            <SponsorBanner />
            <SearchResults />
          </div>
        </section>
      )}

      {/* Below the fold: hero spacer + section cards */}
      {!hasSearched && (
        <>
          <div className="h-screen" aria-hidden="true" />
          <div className="relative z-10 bg-bg-base">
            <HomeSections />
          </div>
        </>
      )}

      {/* Single persistent search — never unmounts, position via bottom only */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-full px-4 ${
          searchAtBottom
            ? "bottom-6 max-w-3xl"
            : "bottom-1/2 translate-y-1/2 max-w-[600px]"
        }`}
      >
        {/* Hero text — CSS hide instead of unmount to prevent layout shift */}
        <div
          className={`text-center overflow-hidden transition-all duration-150 ${
            searchAtBottom ? "max-h-0 opacity-0 mb-0" : "max-h-40 opacity-100 mb-8"
          }`}
          aria-hidden={searchAtBottom}
        >
          <h1 className="text-white text-2xl sm:text-4xl font-semibold tracking-tight drop-shadow-[0_1px_8px_rgba(31,61,188,0.25)] leading-snug">
            AI로 검색해도 잘 나오지 않는
            <br />
            실무 디자인, 피그마 정보를 확인하세요.
          </h1>
          <p className="text-gray-300/90 mt-3 sm:mt-4 text-sm sm:text-base">
            단축키, 용어, 플러그인, 프롬프트, 템플릿 — 디자인과 피그마 실무 정보를 한곳에서.
          </p>
        </div>
        <HeroSearch />
      </div>
    </main>
  );
}
