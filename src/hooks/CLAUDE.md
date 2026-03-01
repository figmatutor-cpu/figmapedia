# 훅 사용 패턴

모든 훅은 `"use client"` 클라이언트 전용. 서버 컴포넌트에서 직접 호출 불가.

## 훅 목록 & 역할

| 훅 | 역할 | 의존 |
|----|------|------|
| `useSearch` | 하이브리드 검색 통합 (메인 훅) | useSearchIndex, useAISearch, useDebounce |
| `useSearchIndex` | `/api/search-index` fetch + 캐싱 | — |
| `useAISearch` | `/api/ai-search` POST + AbortController | — |
| `useDebounce` | 값 디바운스 (200ms) | — |
| `useSectionData` | `/api/section-data` fetch (단일/멀티) | — |
| `useSectionFilter` | FilterConfig 기반 아이템 필터링 | — |
| `useThumbnail` | 썸네일 단계적 resolve | — |

## 검색 흐름 (useSearch)

```
타이핑 → 200ms 디바운스 → Fuse.js 즉시 결과 (searchMode: "instant")
Enter  → triggerAISearch → /api/ai-search → Gemini 결과 (searchMode: "ai")
AI 후 다시 타이핑 → instant 모드로 자동 복귀
```

- `aiQueryRef`로 AI 검색 시점의 쿼리 보관, 텍스트 변경 감지 시 instant 복귀
- `cancelAISearch`: AbortController로 진행 중인 AI 요청 취소

## 썸네일 흐름 (useThumbnail)

```
서버 사전 처리 (enrichWithThumbnails)
  → entry.thumbnail 있으면 즉시 반환
  → 없으면 클라이언트 fallback:
     1. entry.link → /api/og-image (OG 이미지)
     2. 없으면 → /api/page-thumbnail (Notion 블록 첫 이미지)
```

- `enabled` 파라미터로 불필요한 fetch 방지
- cleanup 함수로 unmount 시 상태 업데이트 방지 (`cancelled` 플래그)

## 섹션 데이터 흐름

```
서버 page.tsx → getCachedSectionData() → initialSectionItems/initialMultiSectionData
  → SectionPageLayout → useSectionItems / useMultiSectionItems (initialData 있으면 fetch 스킵)
  → baseItems (탭/필터 적용) → displayItems (검색어 필터)
```

- `useSectionFilter`: `FilterConfig` (titleKeywords, categoryMatch, titleExclude 등) 기반 필터링
- `filterByCategory`: 카테고리 exact match 필터 (SubTab.categoryFilter 용)
