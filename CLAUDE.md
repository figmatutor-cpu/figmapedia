# Figmapedia Renewal - AI Context Document

> 이 문서는 AI(Claude)가 프로젝트를 빠르게 이해하기 위한 컨텍스트 파일입니다.

---

## AI 필수 체크리스트 (코드 작성 전 반드시 확인)

> **이 체크리스트를 건너뛰고 코드를 작성하면 안 됩니다.**

코드 작성/수정 요청을 받으면, 반드시 아래 순서대로 진행하세요:

### Step 1: 먼저 이해했는지 확인

- [ ] 문제/요청이 무엇인지 명확히 이해했는가?
- [ ] 불분명한 부분이 있으면 사용자에게 질문했는가?

### Step 2: 원인 분석 (문제 해결의 경우)

- [ ] "~일 것 같습니다"가 아니라 실제 코드를 확인했는가?
- [ ] 가설은 "가설입니다"라고 명시하고, 검증 후 "확인 결과"로 결론 내렸는가?

### Step 3: 작업 계획 보고 (코드 작성 전 필수!)

- [ ] 아래 작업 계획 보고 템플릿으로 사용자에게 보고하고 승인을 받았는가?

### Step 4: 승인 후 작업 실행

- [ ] 사용자 승인을 받은 후에만 코드 작성 시작

### Step 5: 완료 전 검증

- [ ] `npm run build` 통과 확인
- [ ] 실제 동작 테스트 (가능한 경우)
- [ ] 검증 실패 시 "완료"라고 하지 않고 문제 보고

---

## AI 작업 원칙

> **이 섹션은 모든 작업의 기본 원칙입니다. 반드시 숙지 후 작업을 시작하세요.**

### 문제 해결 프로세스 (필수!)

> **추측을 사실처럼 말하지 말 것!** 모든 가설은 반드시 검증 후 결론 내리기.

#### 1단계: 문제 발견

```
- 문제 현상을 명확히 기술
- 에러 메시지, 로그, 재현 조건 수집
- 사용자에게 추가 맥락 요청 (필요시)
```

#### 2단계: 원인 분석 (가설 -> 검증 -> 정의)

```
1. 가설 수립: "~일 가능성이 있다" (추측임을 명시!)
2. 가설 검증: 실제 코드/로그/상태 확인으로 증명
3. 원인 정의: 검증된 사실만 원인으로 확정
```

#### 3단계: 해결책 탐색

```
1. 해결 방안 2-3개 제시
2. 각 방안의 영향 범위 분석
3. 사전 검증 가능하면 검증 (불가능하면 "실험 필요"라고 명시)
4. 사용자 선택 대기
```

#### 4단계: 해결 계획 정리 (작업 전 필수 보고)

아래 형식으로 사용자에게 보고하고, **승인을 받은 후** 작업을 시작하세요:

```
작업 계획 보고

문제 상황: 현재 어떤 문제가 있는지
목표: 이 작업이 완료되면 어떤 상태가 되어야 하는지
원인 분석: 검증된 원인만 기술

변경 예정 파일:
| 파일 경로 | 변경 내용 | 비고 |
|-----------|----------|------|

Before -> After:
[Before] 현재 상태
[After] 작업 후 기대 상태

이대로 진행해도 될까요?
```

#### 5~7단계: 실행 -> 검증 -> 완료

- 계획대로 작업 진행, 중간에 예상치 못한 상황 시 중단 후 보고
- "기대 상태" 달성 확인 후에만 "완료" 선언
- 검증 실패 시 "완료"라고 하지 말고 문제 보고

### 작업 완료 기준 (Definition of Done)

| 단계 | 확인 항목 | 필수 |
|------|-----------|------|
| 1 | 빌드 통과: `npm run build` 에러 없음 | 필수 |
| 2 | 동작 테스트: 브라우저에서 기능 정상 동작 확인 | 필수 |
| 3 | 회귀 테스트: 기존 기능이 깨지지 않았는지 확인 | 필수 |

### 금지 사항

| 금지 | 이유 |
|------|------|
| 허락 없이 새 파일/컴포넌트 생성 | 프로젝트 구조 임의 변경 방지 |
| 기존 아키텍처 임의 변경 | 설계 의도 훼손 방지 |
| 요청 범위 밖 리팩토링 | 스코프 크립 방지 |
| 문제 발견 시 바로 수정 | 사용자가 다른 해결책을 원할 수 있음 |
| .env.example 생성/수정 | .env.local에서 직접 관리 |

---

## 프로젝트 개요

**Figmapedia** — 피그마(Figma) 디자인 도구 한국어 지식 베이스

> 도메인: `figmapediarenewal.vercel.app`
> GitHub: https://github.com/figmatutor-cpu/figmapedia

AI로 검색해도 잘 나오지 않는 실무 디자인 정보를 체계적으로 제공하는 플랫폼

- **데이터 소스**: Notion 데이터베이스 (9개 DB)
- **검색**: Fuse.js 즉시 검색 + Gemini AI 자연어 검색
- **동기화**: Notion Automation webhook -> On-demand ISR

---

## 기술 스택

```
Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS 4
Notion API (@notionhq/client) + Gemini 2.5 Flash (@google/generative-ai)
Fuse.js (퍼지 검색) + Three.js (히어로 웨이브 애니메이션) + GSAP
```

### 호스팅 & 배포

```
Vercel (Hobby) — npx vercel --prod로 수동 배포
GitHub: figmatutor-cpu/figmapedia (main 브랜치)
```

### 외부 서비스

```
Notion API — CMS/데이터 소스 (유료 Plus 플랜)
Gemini 2.5 Flash — AI 자연어 검색 (Tier 1)
Vercel — 호스팅 + Serverless Functions
```

---

## 아키텍처

### High-Level Flow

```
Notion DB (9개)
    |
    v
Next.js API Routes (Vercel)
    |-- /api/search-index    GET  — 전체 검색 인덱스 (unstable_cache)
    |-- /api/section-data    GET  — 섹션별 데이터 (unstable_cache)
    |-- /api/ai-search       POST — Gemini AI 자연어 검색
    |-- /api/revalidate      POST — Notion webhook 캐시 갱신
    |
    v
Client (React 19)
    |-- Fuse.js 즉시 검색 (타이핑 중)
    |-- Gemini AI 검색 (Enter 키)
```

### 검색 아키텍처 (하이브리드)

```
사용자 타이핑 -> 200ms 디바운스 -> Fuse.js 즉시 결과 (client-side)
사용자 Enter  -> /api/ai-search -> Fuse.js 사전필터(50개) -> Gemini API -> 결과 반환
```

### 캐싱 전략

| 레이어 | TTL | 갱신 방식 |
|--------|-----|----------|
| unstable_cache (search-index) | 300초 | revalidateTag("search-index", "max") |
| unstable_cache (section-data) | 60초 | revalidateTag("section-data", "max") |
| AI 응답 캐시 (Map) | 5분 / 최대 200개 | 동일 쿼리 재사용 |
| CDN / 브라우저 | no-store | 캐시 없음 (Notion 실시간 반영) |

### Notion 동기화

```
Notion 콘텐츠 추가/수정
    -> Notion Automation (webhook)
    -> POST /api/revalidate?secret=xxx
    -> revalidateTag("search-index", "max") + revalidateTag("section-data", "max")
    -> 다음 요청 시 Notion API에서 최신 데이터 fetch
```

---

## 프로젝트 구조

```
figmapedia_renewal/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # 홈 (히어로 + 검색)
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── globals.css             # Tailwind 4 + 커스텀 브레이크포인트
│   │   ├── entry/[id]/page.tsx     # 개별 항목 상세
│   │   ├── figma-info/page.tsx     # 피그마 정보 섹션
│   │   ├── kiosk-food/page.tsx     # 키오스크 섹션
│   │   ├── prompt-pedia/page.tsx   # 프롬프트 섹션
│   │   ├── uxui-study/page.tsx     # UX/UI 스터디 섹션
│   │   └── api/
│   │       ├── search-index/route.ts   # 검색 인덱스 API
│   │       ├── section-data/route.ts   # 섹션 데이터 API
│   │       ├── ai-search/route.ts      # AI 검색 API
│   │       └── revalidate/route.ts     # Notion webhook 캐시 갱신
│   │
│   ├── components/
│   │   ├── cards/EntryCard.tsx         # 항목 카드
│   │   ├── entry/NotionBlockRenderer.tsx # Notion 블록 렌더러
│   │   ├── hero/HeroWave.tsx           # Three.js 웨이브 애니메이션
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # 네비게이션 바
│   │   │   ├── Footer.tsx              # 푸터
│   │   │   └── ClientProviders.tsx     # 클라이언트 프로바이더
│   │   ├── search/
│   │   │   ├── SearchProvider.tsx      # 검색 Context
│   │   │   ├── HeroSearch.tsx          # 홈 검색 인풋
│   │   │   ├── SearchBar.tsx           # 서브페이지 검색 바
│   │   │   ├── SearchResults.tsx       # 검색 결과 + AI 요약
│   │   │   └── GlobalSearchOverlay.tsx # 서브페이지 검색 오버레이
│   │   ├── section/SectionPageLayout.tsx # 섹션 페이지 공통 레이아웃
│   │   └── ui/                         # 공통 UI (Badge, Skeleton, EmptyState)
│   │
│   ├── hooks/
│   │   ├── useSearch.ts            # 하이브리드 검색 (Fuse + AI)
│   │   ├── useAISearch.ts          # AI 검색 상태 관리
│   │   ├── useSearchIndex.ts       # 검색 인덱스 fetch
│   │   ├── useDebounce.ts          # 디바운스 훅
│   │   ├── useSectionData.ts       # 섹션 데이터 fetch
│   │   └── useSectionFilter.ts     # 섹션 필터 로직
│   │
│   ├── lib/
│   │   ├── notion.ts               # Notion API 클라이언트
│   │   ├── notion-mapper.ts        # Notion -> SearchIndexItem 매퍼
│   │   ├── gemini.ts               # Gemini AI 클라이언트
│   │   ├── navigation.ts           # 네비게이션 설정 (NavItem, SubTab)
│   │   ├── section-databases.ts    # Notion DB ID 설정
│   │   ├── search-index-cache.ts   # 검색 인덱스 캐시 (unstable_cache)
│   │   └── constants.ts            # 상수
│   │
│   └── types/index.ts              # 타입 정의 (SearchIndexItem, AISearchResponse 등)
│
├── public/                         # 정적 파일
├── CLAUDE.md                       # 이 파일
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 핵심 데이터 모델

### Notion 데이터베이스 (9개)

| DB | 키 (section-databases.ts) | 매퍼 |
|----|--------------------------|------|
| 메인 Q&A | NOTION_DATABASE_ID (.env) | mapNotionPageToEntry |
| 프롬프트 | prompt | mapPromptPage |
| 키오스크 | kiosk | mapKioskPage |
| UX/UI 아티클 | uxuiArticles | mapArticlePage |
| 테크 블로그 | techBlogs | mapArticlePage |
| UX/UI 용어 | uxuiTerms | mapUxuiTermPage |
| Mac 단축키 | macShortcuts | mapShortcutPage |
| Win 단축키 | winShortcuts | mapShortcutPage |
| 플러그인 | plugins | mapPluginPage |

### SearchIndexItem (공통 타입)

```typescript
interface SearchIndexItem {
  id: string;
  title: string;
  categories: string[];
  author: string | null;
  link: string | null;
  publishedDate: string | null;
  shortcut?: string;    // 단축키 DB 전용
}
```

---

## 핵심 제약사항 & 주의사항

### 1. Tailwind CSS 4 문법

```css
/* globals.css에서 커스텀 브레이크포인트 정의 */
@theme inline {
  --breakpoint-xl-nav: 1080px;
}

/* Tailwind 4에서 변경된 클래스명 */
bg-linear-to-br   (O)    /* Tailwind 4 */
bg-gradient-to-br  (X)    /* Tailwind 3 — 사용 금지 */
```

### 2. Next.js 16 revalidateTag

```typescript
// Next.js 16에서 두 번째 인자 필수
revalidateTag("search-index", "max");   // (O)
revalidateTag("search-index");          // (X) — deprecated 경고
```

### 3. 환경 변수

```
NOTION_API_KEY          — Notion Integration 토큰
NOTION_DATABASE_ID      — 메인 Q&A 데이터베이스 ID
GEMINI_API_KEY          — Google Gemini API 키
REVALIDATION_SECRET     — Notion webhook 인증 토큰
NEXT_PUBLIC_SITE_URL    — 사이트 URL (로컬: http://localhost:3000)
```

- `.env.local`에서 직접 관리
- `.env.example` 파일 생성/수정 금지
- Vercel 환경 변수는 CLI로 설정: `npx vercel env add <NAME> production`
- Vercel에 환경 변수 설정 시 `echo`로 pipe하면 줄바꿈/플래그가 값에 포함될 수 있음 -> 파일로 pipe할 것

### 4. Gemini API

```typescript
// 사용 모델: gemini-2.5-flash (src/lib/gemini.ts)
// gemini-2.0-flash, gemini-2.0-flash-001 -> 404 에러 (deprecated)
// thinkingConfig: { thinkingBudget: 0 } -> 응답 속도 최적화
```

### 5. 모바일 iOS 대응

```
- 검색 input font-size: 16px 이상 (미만 시 iOS 자동 줌인)
- type="text" + enterKeyHint="search" (type="search" 사용 금지 — iOS 특수 동작)
- 검색바 위치 전환 시 bottom 속성만 사용 (top <-> bottom 전환 시 iOS 포커스 손실)
- 히어로 텍스트 CSS hide (max-h-0/opacity-0) — 조건부 렌더링(unmount) 시 포커스 손실
```

### 6. 반응형 브레이크포인트

```
xl-nav (1080px) — 네비게이션 데스크탑/모바일 전환 기준
1080px 이하: 햄버거 메뉴, 섹션 필터 숨김 (검색만 표시)
1080px 이상: 전체 네비게이션, 필터 탭 표시
```

---

## 주요 플로우

### 새 섹션 DB 추가 시

1. `src/lib/section-databases.ts` — DB ID 추가
2. `src/lib/notion-mapper.ts` — 매퍼 함수 추가
3. `src/app/api/section-data/route.ts` — fetch + map 추가
4. `src/lib/search-index-cache.ts` — 검색 인덱스에 포함
5. `src/lib/navigation.ts` — NavItem/SubTab 추가
6. `src/app/<section>/page.tsx` — 페이지 생성
7. Notion에 자동화 2개 추가 (페이지 추가 + 속성 편집 webhook)

### 배포 플로우

```bash
git add <files> && git commit -m "message" && git push origin main
npx vercel --prod
```

---

## 개발 가이드

### 로컬 환경

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev -- -p 3003  # 포트 변경 시
npm run build        # 프로덕션 빌드 확인
```

### 커밋 메시지 컨벤션

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서 수정

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 트러블슈팅

### Notion 데이터 미반영

1. Notion 자동화(webhook) 동작 확인
2. `curl -X POST "https://figmapediarenewal.vercel.app/api/revalidate?secret=<SECRET>"` 직접 테스트
3. Vercel 환경 변수 REVALIDATION_SECRET 값 확인 (줄바꿈, 공백 주의)

### AI 검색 실패

1. Gemini API 키 유효성 확인
2. Gemini 모델명 확인 (gemini-2.5-flash)
3. Rate limit (429) 확인 -> Tier 1 이상 필요

### 모바일 키보드 내림 현상

1. 검색 input이 unmount/remount 되지 않는지 확인
2. 컨테이너 CSS 위치 전환이 bottom 속성만 사용하는지 확인
3. font-size 16px 이상인지 확인

---

**Last Updated**: 2026-02-23
**Version**: 1.0.0
**Project**: Figmapedia Renewal
