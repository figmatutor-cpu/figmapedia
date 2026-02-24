"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSearchContext } from "./SearchProvider";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import { SEARCH_PLACEHOLDER } from "@/lib/constants";

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
      <SearchInput
        ref={inputRef}
        query={query}
        onQueryChange={setQuery}
        onSearch={triggerAISearch}
        isSearching={isAISearching}
        placeholder={SEARCH_PLACEHOLDER}
        variant="overlay"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      />
    </>
  );
}
