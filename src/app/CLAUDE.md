# App Router — 라우트 & API 패턴

## 페이지 라우트

| 경로            | 파일                    | 데이터 소스                                              |
| --------------- | ----------------------- | -------------------------------------------------------- |
| `/`             | `page.tsx`              | 없음 (히어로 + 검색)                                     |
| `/figma-info`   | `figma-info/page.tsx`   | 메인 DB (카테고리 필터)                                  |
| `/prompt-pedia` | `prompt-pedia/page.tsx` | `prompt` 섹션 DB                                         |
| `/kiosk-food`   | `kiosk-food/page.tsx`   | `kiosk` 섹션 DB                                          |
| `/uxui-study`   | `uxui-study/page.tsx`   | `uxui-articles`, `uxui-blogs`, `uxui-terms` 멀티 섹션 DB |
| `/entry/[id]`   | `entry/[id]/page.tsx`   | Notion 페이지 블록 직접 fetch                            |

- 모든 섹션 페이지는 `SectionPageLayout` 공통 컴포넌트 사용
- 각 섹션 page.tsx는 서버 컴포넌트로 `getCachedSectionData()` 호출 후 초기 데이터를 props로 전달

### AI 리포트 (Notion 아님 — 외부 앱 + iframe)

| 경로                     | 파일                             | 비고                                          |
| ------------------------ | -------------------------------- | --------------------------------------------- |
| `/ai-report`             | `ai-report/page.tsx`             | 목록 1페이지 (static)                         |
| `/ai-report/page/[page]` | `ai-report/page/[page]/page.tsx` | 2페이지 이상. `generateStaticParams` 프리렌더 |
| `/ai-report/[issue]`     | `ai-report/[issue]/page.tsx`     | 상세 — 본문은 리포트 앱 iframe + 댓글         |

- 목록 렌더링은 `components/ai-report/IssueList.tsx`를 두 라우트가 공유
- 페이지네이션을 `?page=`가 아닌 경로로 둔 이유: `searchParams`를 읽으면
  라우트가 dynamic으로 내려가 HTML CDN 캐싱을 잃는다
- 2페이지 이상은 `robots: noindex, follow` (본문 없는 목록 하위 페이지)
- 데이터/캐시 규칙은 `src/lib/CLAUDE.md`의 AI 리포트 항목 참조

## API 라우트

| 엔드포인트                        | 메서드 | 역할                                         |
| --------------------------------- | ------ | -------------------------------------------- |
| `/api/search-index`               | GET    | 전체 검색 인덱스 (unstable_cache, 300초 TTL) |
| `/api/section-data?section=<key>` | GET    | 섹션별 데이터 (unstable_cache, 600초 TTL)    |
| `/api/ai-search`                  | POST   | Gemini AI 자연어 검색                        |
| `/api/revalidate?secret=<token>`  | POST   | Notion webhook → 캐시 갱신                   |
| `/api/og-image?url=<url>`         | GET    | 외부 URL OG 이미지 추출                      |
| `/api/page-thumbnail?pageId=<id>` | GET    | Notion 페이지 블록 첫 이미지                 |

### API 캐싱 규칙

```typescript
// Next.js 16에서 revalidateTag 두 번째 인자 필수
revalidateTag("search-index", "max"); // O
revalidateTag("search-index"); // X — deprecated 경고
```

- `unstable_cache` 사용 시 반드시 `tags` 배열 포함
- API 응답은 `no-store` (CDN/브라우저 캐시 없음, Notion 실시간 반영)

## 새 섹션 DB 추가 플로우

1. `src/lib/section-databases.ts` — DB ID 추가
2. `src/lib/notion-mapper.ts` — 매퍼 함수 추가
3. `src/lib/section-data-cache.ts` — fetch + map + enrich 추가
4. `src/app/api/section-data/route.ts` — 섹션 키 핸들링 추가
5. `src/lib/navigation.ts` — NavItem/SubTab 추가
6. `src/app/<section>/page.tsx` — 페이지 생성
7. Notion에 자동화 2개 추가 (페이지 추가 + 속성 편집 webhook)

## globals.css

- Tailwind 4 `@theme inline {}` 블록에서 커스텀 변수 정의
- 디자인 토큰 상세 → `src/CLAUDE.md` 참조
