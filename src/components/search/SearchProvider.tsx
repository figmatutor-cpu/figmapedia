"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useSearch, type SearchMode } from "@/hooks/useSearch";
import type { SearchIndexItem } from "@/types";

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  results: SearchIndexItem[];
  isLoading: boolean;
  isAISearching: boolean;
  hasSearched: boolean;
  totalCount: number;
  searchMode: SearchMode;
  triggerAISearch: () => Promise<void>;
  aiError: string | null;
  /** AI 검색 결과 요약 텍스트 */
  aiSummary: string | null;
  /** AI 검색 취소 */
  cancelAISearch: () => void;
  /** Whether the global floating search overlay is open */
  isSearchOpen: boolean;
  /** Open the global floating search overlay */
  openSearch: () => void;
  /** Close the global floating search overlay */
  closeSearch: () => void;
  /** Toggle the global floating search overlay */
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const search = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((p) => !p), []);

  return (
    <SearchContext.Provider
      value={{ ...search, isSearchOpen, openSearch, closeSearch, toggleSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
}
