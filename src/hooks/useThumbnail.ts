"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 엔트리의 썸네일을 단계적으로 resolve하는 통합 훅
 * 우선순위: cover(즉시) → OG 이미지(link 있을 때) → Notion 블록 첫 이미지
 *
 * S3 URL은 만료될 수 있으므로, 이미지 로드 실패 시 onError()를 호출하면
 * fallback 체인을 시도합니다.
 */
export function useThumbnail(
  entry: { id: string; thumbnail?: string; link?: string | null },
  enabled: boolean,
): { url: string | null; onError: () => void } {
  const [fallback, setFallback] = useState<string | null>(null);
  const [primaryFailed, setPrimaryFailed] = useState(false);

  // 이미지 로드 실패 시 호출 → fallback 체인 시작
  const onError = useCallback(() => setPrimaryFailed(true), []);

  // primary thumbnail이 바뀌면 실패 상태 리셋
  useEffect(() => {
    setPrimaryFailed(false);
    setFallback(null);
  }, [entry.thumbnail]);

  // thumbnail이 없거나, S3 URL 로드 실패 시 fallback resolve
  const needsFallback = !entry.thumbnail || primaryFailed;

  useEffect(() => {
    if (!enabled || !needsFallback) return;

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
  }, [entry.id, entry.link, enabled, needsFallback]);

  // primary가 실패했거나 없으면 fallback 사용
  const url = (!primaryFailed && entry.thumbnail) ? entry.thumbnail : fallback;
  return { url, onError };
}
