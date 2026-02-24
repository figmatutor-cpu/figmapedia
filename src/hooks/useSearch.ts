"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { SearchIndexItem } from "@/types";
import { useDebounce } from "./useDebounce";
import { useSearchIndex } from "./useSearchIndex";
import { useAISearch } from "./useAISearch";

const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "categories", weight: 0.25 },
    { name: "author", weight: 0.25 },
  ],
  threshold: 0.3,
  distance: 200,
  minMatchCharLength: 1,
  includeScore: true,
};

export type SearchMode = "instant" | "ai";

export function useSearch() {
  const { items: index, isLoading } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("instant");
  const aiQueryRef = useRef<string>("");

  const {
    aiResults,
    aiSummary,
    isAISearching,
    aiError,
    triggerAISearch: triggerAI,
    clearAIResults,
  } = useAISearch();

  const debouncedQuery = useDebounce(query, 200);

  const fuse = useMemo(
    () => (index.length > 0 ? new Fuse(index, FUSE_OPTIONS) : null),
    [index]
  );


  // When query text changes AFTER an AI search, revert to instant mode
  // Only revert if the user actually typed something different
  useEffect(() => {
    if (searchMode === "ai" && debouncedQuery !== aiQueryRef.current) {
      setSearchMode("instant");
      clearAIResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const fuseResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    if (fuse) {
      return fuse.search(debouncedQuery).map((result) => result.item);
    }
    return index.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, index, fuse]);

  const triggerAISearch = useCallback(async () => {
    if (!query.trim()) return;
    setHasSearched(true);
    setSearchMode("ai");
    aiQueryRef.current = query;
    await triggerAI(query);
  }, [query, triggerAI]);

  const results = searchMode === "ai" && aiResults.length > 0
    ? aiResults
    : fuseResults;

  return {
    query,
    setQuery,
    results,
    isLoading,
    isAISearching,
    hasSearched,
    totalCount: index.length,
    searchMode,
    triggerAISearch,
    aiError,
    aiSummary,
  };
}
