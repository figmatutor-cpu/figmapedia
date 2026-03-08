"use client";

import { useState, useEffect } from "react";
import { useSearchContext } from "./SearchProvider";
import { EntryCard } from "@/components/cards/EntryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  AI_SEARCH_LABEL,
  AI_SUMMARY_LABEL,
  FALLBACK_RESULTS_MESSAGE,
  getRecommendedLinks,
} from "@/lib/constants";
import type { SearchIndexItem } from "@/types";

const TYPING_MESSAGES = ["AI 검색 중", "Figmapedia DB와 결합 중"];

function TypingText() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let msgIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    function step() {
      const text = TYPING_MESSAGES[msgIdx];
      if (!deleting) {
        charIdx++;
        setDisplayed(text.slice(0, charIdx));
        if (charIdx >= text.length) {
          timer = setTimeout(() => { deleting = true; step(); }, 1200);
        } else {
          timer = setTimeout(step, 60);
        }
      } else {
        charIdx--;
        setDisplayed(text.slice(0, charIdx));
        if (charIdx <= 0) {
          deleting = false;
          msgIdx = (msgIdx + 1) % TYPING_MESSAGES.length;
          timer = setTimeout(step, 300);
        } else {
          timer = setTimeout(step, 35);
        }
      }
    }

    step();
    return () => clearTimeout(timer);
  }, []);

  return (
    <p className="-mt-[72px] text-sm text-white">
      {displayed}
      <span className="inline-block w-[2px] h-[14px] bg-white ml-0.5 align-middle animate-pulse" />
    </p>
  );
}

function AISummaryCard({ summary, sources, query }: { summary: string; sources?: SearchIndexItem[]; query: string }) {
  const recommendedLinks = getRecommendedLinks(query);

  return (
    <div className="rounded-xl border border-brand-blue-accent/20 bg-brand-blue-accent/5 p-4 mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">✨</span>
        <span className="text-xs font-medium text-brand-blue-accent">{AI_SUMMARY_LABEL}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
        {summary}
      </p>
      {(sources && sources.length > 0) || recommendedLinks.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-brand-blue-accent/15">
          <p className="text-xs text-gray-500 mb-1.5">출처</p>
          <ul className="space-y-1 min-w-0">
            {sources?.map((item) => {
              const href = item.link ?? `/entry/${item.id}`;
              const isExternal = !!item.link;
              return (
                <li key={item.id} className="min-w-0">
                  <a
                    href={href}
                    target={isExternal ? "_blank" : "_self"}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 text-xs text-brand-blue-accent/80 hover:text-brand-blue-accent transition-colors min-w-0"
                  >
                    <span className="truncate">{item.title}</span>
                    {item.section && (
                      <span className="shrink-0 text-gray-500">· {item.section}</span>
                    )}
                  </a>
                </li>
              );
            })}
            {recommendedLinks.map((link) => (
              <li key={link.url} className="min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-blue-accent/80 hover:text-brand-blue-accent transition-colors min-w-0"
                >
                  <span className="truncate">{link.title}</span>
                  <span className="shrink-0 text-gray-500">· 추천</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <LoadingSpinner className="w-60 h-60" />
        <TypingText />
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
        <AISummaryCard summary={aiSummary} sources={results.slice(0, 3)} query={query} />
      )}

      {/* 관련 콘텐츠 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        {searchMode === "ai" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue-accent/10 border border-brand-blue-accent/20 text-xs text-brand-blue-accent">
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
