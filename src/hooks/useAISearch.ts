"use client";

import { useState, useRef, useCallback } from "react";
import type { SearchIndexItem, AISearchResponse } from "@/types";

export function useAISearch() {
  const [aiResults, setAIResults] = useState<SearchIndexItem[]>([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const triggerAISearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAISearching(true);
    setAIError(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI 검색에 실패했습니다.");
      }

      const data: AISearchResponse = await res.json();
      setAIResults(data.results);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setAIError(
        err instanceof Error ? err.message : "AI 검색에 실패했습니다."
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsAISearching(false);
      }
    }
  }, []);

  const clearAIResults = useCallback(() => {
    setAIResults([]);
    setAIError(null);
  }, []);

  return {
    aiResults,
    isAISearching,
    aiError,
    triggerAISearch,
    clearAIResults,
  };
}
