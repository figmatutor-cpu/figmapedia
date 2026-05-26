"use client";

import { useSearchContext } from "./SearchProvider";
import { SearchIcon } from "@/components/ui/SearchIcon";

export function SearchBar() {
  const {
    query,
    setQuery,
    totalCount,
    triggerAISearch,
    isAISearching,
    cancelAISearch,
  } = useSearchContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && query.trim() && !isAISearching) {
      e.preventDefault();
      triggerAISearch();
    }
  };

  return (
    <div className="relative mb-6">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-3" />
      <input
        type="text"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${totalCount}개의 항목에서 검색... (Enter로 AI 검색)`}
        className="w-full rounded-xl border border-border-1 bg-glass-1 pl-12 pr-14 py-3.5 text-body-lg text-fg-2 placeholder:text-fg-4 focus:border-border-3 focus:bg-glass-2 focus:outline-none transition-all"
        autoComplete="off"
        lang="ko"
      />
      {isAISearching && (
        <button
          type="button"
          onClick={cancelAISearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-glass-3 hover:bg-glass-4 text-fg-2 text-meta font-medium transition-colors"
        >
          <span className="block w-2 h-2 rounded-sm bg-current shrink-0" />
          정지
        </button>
      )}
    </div>
  );
}
