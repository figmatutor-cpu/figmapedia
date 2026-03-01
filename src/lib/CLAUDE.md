# 데이터 레이어 — Notion API, 캐싱, 매퍼

## Notion 데이터베이스 매핑 (9개)

| DB | 키 (section-databases.ts) | 매퍼 (notion-mapper.ts) |
|----|--------------------------|------------------------|
| 메인 Q&A | `NOTION_DATABASE_ID` (.env) | `mapNotionPageToEntry` |
| 프롬프트 | `prompt` | `mapPromptPage` |
| 키오스크 | `kiosk` | `mapKioskPage` |
| UX/UI 아티클 | `uxuiArticles` | `mapArticlePage` |
| 테크 블로그 | `techBlogs` | `mapArticlePage` |
| UX/UI 용어 | `uxuiTerms` | `mapUxuiTermPage` |
| Mac 단축키 | `macShortcuts` | `mapShortcutPage` |
| Win 단축키 | `winShortcuts` | `mapShortcutPage` |
| 플러그인 | `plugins` | `mapPluginPage` |

## 핵심 타입 (types/index.ts)

```typescript
interface SearchIndexItem {
  id: string;
  title: string;
  categories: string[];
  author: string;
  link: string | null;        // 외부 URL (아티클, 블로그)
  publishedDate: string | null;
  shortcut?: string;          // 단축키 DB 전용
  thumbnail?: string;         // Notion 커버 이미지 URL
  section?: string;           // 소속 섹션 (AI 검색용)
}
```

## 캐싱 전략

| 레이어 | TTL | 갱신 방식 |
|--------|-----|----------|
| `unstable_cache` (search-index) | 300초 | `revalidateTag("search-index", "max")` |
| `unstable_cache` (section-data) | 600초 | `revalidateTag("section-data", "max")` |
| AI 응답 캐시 (Map) | 5분 / 최대 200개 | 동일 쿼리 재사용 |

### Notion 동기화 플로우

```
Notion 콘텐츠 추가/수정
  → Notion Automation (webhook)
  → POST /api/revalidate?secret=xxx
  → revalidateTag("search-index", "max") + revalidateTag("section-data", "max")
  → 다음 요청 시 최신 데이터 fetch
```

## 썸네일 사전 처리 (section-data-cache.ts)

`enrichWithThumbnails` — 서버에서 thumbnail 없는 아이템을 미리 resolve:
- `GLOBAL_TIMEOUT_MS`: 5000ms (전체 enrichment 타임아웃)
- `PER_ITEM_TIMEOUT_MS`: 1500ms (개별 아이템)
- concurrency: 내부 Notion API → 3, 외부 OG 스크래핑 → 10
- 우선순위: OG 이미지(link) → Notion 블록 첫 이미지

## Gemini AI (gemini.ts)

- 모델: `gemini-2.5-flash` (다른 모델 404 에러)
- `thinkingConfig: { thinkingBudget: 0 }` — 응답 속도 최적화
- Fuse.js로 사전 필터(50개) → Gemini에 전달

## navigation.ts

`NAV_ITEMS` 배열로 네비게이션 구조 정의:
- `NavItem`: 페이지 단위 (key, label, href, subTabs)
- `SubTab`: 탭 단위 (filter, sectionDataKey, categoryFilter, showThumbnail, cardLayout, externalLink)
