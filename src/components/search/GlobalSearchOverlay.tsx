"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSearchContext } from "./SearchProvider";
import { SearchResults } from "./SearchResults";

export function GlobalSearchOverlay() {
  const {
    query,
    setQuery,
    isSearchOpen,
    closeSearch,
    triggerAISearch,
    isAISearching,
    hasSearched,
  } = useSearchContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Close overlay on route change
  useEffect(() => {
    closeSearch();
  }, [pathname, closeSearch]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // On home page, the home page handles its own search UI (hero search)
  // The global overlay is for all OTHER pages
  if (isHome) return null;
  if (!isSearchOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim() && !isAISearching) {
      e.preventDefault();
      triggerAISearch();
    }
  };

  const handleSearchClick = () => {
    if (query.trim() && !isAISearching) {
      triggerAISearch();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={closeSearch}
      />

      {/* Results area — scrollable above the search bar */}
      {hasSearched && (
        <div className="fixed inset-x-0 top-0 bottom-[100px] z-40 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 pt-28 pb-8">
            <SearchResults />
          </div>
        </div>
      )}

      {/* Floating search bar at bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="relative rounded-2xl p-[2px] shadow-[0_-4px_24px_0_rgba(0,0,0,0.3)] bg-linear-to-br from-white/10 via-white/5 to-black/20">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요"
              className="w-full rounded-2xl bg-[rgba(15,15,20,0.85)] border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#1f3dbc]/40 focus:border-[#1f3dbc]/40 backdrop-blur-md pl-12 pr-[100px] py-4 text-base"
              autoComplete="off"
              lang="ko"
            />
            <button
              type="button"
              onClick={handleSearchClick}
              disabled={isAISearching || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-[#f0f2ff] text-black text-sm font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isAISearching ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "AI 검색"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
