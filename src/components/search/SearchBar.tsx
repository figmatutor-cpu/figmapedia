"use client";

import { useSearchContext } from "./SearchProvider";
import { SearchIcon } from "@/components/ui/SearchIcon";

export function SearchBar() {
  const { query, setQuery, totalCount, triggerAISearch, isAISearching, cancelAISearch } = useSearchContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && query.trim() && !isAISearching) {
      e.preventDefault();
      triggerAISearch();
    }
  };

  return (
    <div className="relative mb-6">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${totalCount}개의 항목에서 검색... (Enter로 AI 검색)`}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-14 py-3.5 text-base placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        autoComplete="off"
        lang="ko"
      />
      {isAISearching && (
        <button
          type="button"
          onClick={cancelAISearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium transition-colors"
        >
          <span className="block w-2 h-2 rounded-sm bg-current shrink-0" />
          정지
        </button>
      )}
    </div>
  );
}
