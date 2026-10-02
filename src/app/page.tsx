"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { HeroSearch } from "@/components/search/HeroSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchContext } from "@/components/search/SearchProvider";
import { SponsorBanner } from "@/components/ui/SponsorBanner";

const HeroWave = dynamic(
  () =>
    import("@/components/hero/HeroWave").then((m) => ({
      default: m.HeroWave,
    })),
  { ssr: false },
);

export default function HomePage() {
  const { hasSearched } = useSearchContext();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // iOS pans the visual viewport when the keyboard opens, which would push the
  // pinned search off-screen. Track the pan and offset the search back into view.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = searchContainerRef.current;
    if (!isSearchFocused || !vv || !el) return;
    const update = () =>
      el.style.setProperty("--vv-offset", `${vv.offsetTop}px`);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      el.style.removeProperty("--vv-offset");
    };
  }, [isSearchFocused]);

  const searchAtBottom = hasSearched;

  // Mobile only: while typing, pin search just below the navbar (84px) so the
  // keyboard and iOS AutoFill bar never cover it. 148px = 96px top + 52px input.
  // Position still changes via `bottom` only to keep input focus on iOS.
  const focusedMobileClass = isSearchFocused
    ? "max-md:bottom-[calc(100%_-_var(--spacing)*37)] max-md:translate-y-(--vv-offset,0px)"
    : "";

  return (
    <main className="bg-bg-base">
      {/* Hero background — hidden during search */}
      {!hasSearched && (
        <div className="fixed inset-0 overflow-hidden">
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

      {/* Mobile focus backdrop — dims content behind the pinned search */}
      {isSearchFocused && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
        />
      )}

      {/* Single persistent search — never unmounts, position via bottom only */}
      <div
        ref={searchContainerRef}
        data-home-search-position={searchAtBottom ? "bottom" : "hero"}
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-full px-4 ${
          searchAtBottom
            ? "bottom-6 max-w-3xl"
            : "bottom-1/2 translate-y-1/2 max-w-[600px]"
        } ${focusedMobileClass}`}
      >
        {/* Hero text — CSS hide instead of unmount to prevent layout shift */}
        <div
          className={`text-center overflow-hidden transition-all duration-150 ${
            searchAtBottom
              ? "max-h-0 opacity-0 mb-0"
              : "max-h-40 opacity-100 mb-8"
          } ${isSearchFocused ? "max-md:max-h-0 max-md:opacity-0 max-md:mb-0" : ""}`}
          aria-hidden={searchAtBottom}
        >
          <h1 className="text-white text-2xl sm:text-4xl font-semibold tracking-tight drop-shadow-[0_1px_8px_rgba(31,61,188,0.25)] leading-snug">
            AI로 검색해도 잘 나오지 않는
            <br />
            실무 디자인, 피그마 정보를 확인하세요.
          </h1>
          <p className="text-gray-300/90 mt-3 sm:mt-4 text-sm sm:text-base">
            단축키, 용어, 플러그인, 프롬프트, 템플릿 — 디자인과 피그마 실무
            정보를 한곳에서.
          </p>
        </div>
        <HeroSearch
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </div>
    </main>
  );
}
