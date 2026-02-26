"use client";

import { useSearchContext } from "./SearchProvider";
import { EntryCard } from "@/components/cards/EntryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AI_SEARCH_LABEL,
  AI_SEARCHING_MESSAGE,
  AI_SUMMARY_LABEL,
  FALLBACK_RESULTS_MESSAGE,
} from "@/lib/constants";
import type { SearchIndexItem } from "@/types";

function AISummaryCard({ summary, sources }: { summary: string; sources?: SearchIndexItem[] }) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">✨</span>
        <span className="text-xs font-medium text-blue-400">{AI_SUMMARY_LABEL}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
        {summary}
      </p>
      {sources && sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-500/15">
          <p className="text-xs text-gray-500 mb-1.5">출처</p>
          <ul className="space-y-1">
            {sources.map((item) => {
              const href = item.link ?? `/entry/${item.id}`;
              const isExternal = !!item.link;
              return (
                <li key={item.id}>
                  <a
                    href={href}
                    target={isExternal ? "_blank" : "_self"}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-300 transition-colors"
                  >
                    <span className="truncate">{item.title}</span>
                    {item.section && (
                      <span className="shrink-0 text-gray-500">· {item.section}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SearchResults() {
  const { results, isLoading, isAISearching, query, hasSearched, searchMode, aiError, aiSummary } = useSearchContext();

  if (!hasSearched) {
    return null;
  }

  if (isLoading) {
    return <Skeleton count={6} />;
  }

  if (isAISearching) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-blue-400">{AI_SEARCHING_MESSAGE}</p>
        </div>
        <Skeleton count={4} />
      </div>
    );
  }

  if (aiError) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 mb-4">
          <p className="text-sm text-red-400">{aiError}</p>
          <p className="text-xs text-gray-500 mt-1">{FALLBACK_RESULTS_MESSAGE}</p>
        </div>
        {results.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {results.length}개의 결과
            </p>
            {results.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </>
        ) : (
          <EmptyState query={query} />
        )}
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="space-y-3">
      {/* AI 요약 카드 */}
      {searchMode === "ai" && aiSummary && (
        <AISummaryCard summary={aiSummary} sources={results.slice(0, 3)} />
      )}

      {/* 관련 콘텐츠 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        {searchMode === "ai" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
            {AI_SEARCH_LABEL}
          </span>
        )}
        <p className="text-sm text-gray-400">
          {searchMode === "ai" ? "관련 콘텐츠" : ""} {results.length}개의 결과
        </p>
      </div>

      {/* 결과 목록 */}
      {results.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
