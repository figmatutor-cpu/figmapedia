"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { SearchIcon } from "@/components/ui/SearchIcon";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AI_SEARCH_LABEL } from "@/lib/constants";

interface SearchInputProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  placeholder?: string;
  variant: "hero" | "overlay";
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { query, onQueryChange, onSearch, isSearching, placeholder = "검색어를 입력하세요", variant, className = "" },
    ref
  ) {
    const internalRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && query.trim() && !isSearching) {
        e.preventDefault();
        internalRef.current?.blur();
        onSearch();
      }
    };

    const handleSearchClick = () => {
      if (query.trim() && !isSearching) {
        internalRef.current?.blur();
        onSearch();
      }
    };

    const bgClass = variant === "hero" ? "bg-glass-hero" : "bg-glass-overlay";
    const shadow =
      variant === "hero"
        ? "shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]"
        : "shadow-[0_-4px_24px_0_rgba(0,0,0,0.3)]";
    const iconLeft = "left-[6px]";
    const inputPl = "pl-[28px]";

    return (
      <div className={className}>
        <div className={`relative rounded-2xl p-[2px] ${shadow} bg-linear-to-br from-white/10 via-white/5 to-black/20`}>
          <div className="relative">
            <SearchIcon className={`absolute ${iconLeft} top-1/2 -translate-y-1/2 h-5 w-5 text-white/40`} />
            <input
              ref={internalRef}
              type="text"
              enterKeyHint="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full rounded-2xl ${bgClass} border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/40 backdrop-blur-md ${inputPl} pr-[100px] h-12 sm:h-14 text-base`}
              autoComplete="off"
              lang="ko"
            />
            <button
              type="button"
              onClick={handleSearchClick}
              disabled={isSearching || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-brand-blue-light text-gray-900 text-sm font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSearching ? <LoadingSpinner /> : AI_SEARCH_LABEL}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
