"use client";

import { useSearchContext } from "./SearchProvider";

export function SearchBar() {
  const { query, setQuery, totalCount, triggerAISearch, isAISearching } = useSearchContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim() && !isAISearching) {
      e.preventDefault();
      triggerAISearch();
    }
  };

  return (
    <div className="relative mb-6">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${totalCount}개의 항목에서 검색... (Enter로 AI 검색)`}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-5 py-3.5 text-base placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        autoComplete="off"
        lang="ko"
      />
    </div>
  );
}
