"use client";

import { useState, useEffect } from "react";

/**
 * 엔트리의 썸네일을 단계적으로 resolve하는 통합 훅
 * 우선순위: cover(즉시) → OG 이미지(link 있을 때) → Notion 블록 첫 이미지
 */
export function useThumbnail(
  entry: { id: string; thumbnail?: string; link?: string | null },
  enabled: boolean,
): string | null {
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || entry.thumbnail) return;

    let cancelled = false;

    async function resolve() {
      // 1단계: 외부 링크가 있으면 OG 이미지 시도 (Notion API 사용 안 함)
      if (entry.link) {
        try {
          const res = await fetch(`/api/og-image?url=${encodeURIComponent(entry.link)}`);
          const data = await res.json();
          if (!cancelled && data.ogImage) {
            setFallback(data.ogImage);
            return;
          }
        } catch { /* fall through */ }
      }

      // 2단계: Notion 페이지 블록에서 첫 이미지 시도
      try {
        const res = await fetch(`/api/page-thumbnail?pageId=${entry.id}`);
        const data = await res.json();
        if (!cancelled && data.thumbnail) {
          setFallback(data.thumbnail);
        }
      } catch { /* give up */ }
    }

    resolve();
    return () => { cancelled = true; };
  }, [entry.id, entry.link, entry.thumbnail, enabled]);

  return entry.thumbnail || fallback;
}
