# 컴포넌트 아키텍처

## 폴더 구조

```
components/
├── cards/          # 카드 컴포넌트 (목록 표시)
├── entry/          # 개별 항목 상세 페이지
├── hero/           # 홈 히어로 섹션
├── layout/         # 전역 레이아웃 (Navbar, Footer, ClientProviders)
├── search/         # 검색 시스템
├── section/        # 섹션 페이지 공통 레이아웃
└── ui/             # 공통 UI 원자 컴포넌트
```

## 카드 컴포넌트

| 컴포넌트 | 레이아웃 | 사용 조건 |
|---------|---------|----------|
| `VerticalCard` | 세로형 (grid) | 썸네일 중심, `cardLayout="grid"` |
| `EntryCard` | 가로형 (list) | 텍스트 중심, `cardLayout="list"` (기본값) |

### VerticalCard 조건부 렌더링 순서
1. `externalLink && entry.link` → `<a target="_blank">` (외부 링크)
2. `entry.shortcut` → `<div>` (클릭 불가, 단축키 카드)
3. 기본 → `<Link href="/entry/${id}">` (내부 링크)

## SectionPageLayout 설정

탭(SubTab) 레벨 설정이 페이지 레벨보다 우선:

| 설정 | 타입 | 기본값 | 설명 |
|------|------|-------|------|
| `showThumbnail` | boolean | false | EntryCard 썸네일 표시 |
| `cardLayout` | "list" \| "grid" | "list" | 카드 레이아웃 |
| `externalLink` | boolean | false | entry.link 새 탭 열기 |
| `categoryFilter` | string[] | — | 동일 DB 내 카테고리 필터링 |

## 검색 컴포넌트 계층

```
SearchProvider (Context)
├── HeroSearch        — 홈 페이지 검색 인풋
├── SearchBar         — 서브페이지 검색 바
├── SearchResults     — 검색 결과 목록 + AI 요약 카드
└── GlobalSearchOverlay — 서브페이지 검색 오버레이 (Navbar 트리거)
```

## iOS 모바일 대응 (필수)

- 검색 input `font-size: 16px` 이상 (미만 시 iOS 자동 줌인)
- `type="text"` + `enterKeyHint="search"` (`type="search"` 사용 금지)
- 검색바 위치 전환 시 `bottom` 속성만 사용 (top↔bottom 전환 시 포커스 손실)
- 히어로 텍스트 숨기기: CSS `max-h-0/opacity-0` (조건부 unmount 시 포커스 손실)

## 공통 스타일 패턴

```
카드:   rounded-xl border border-white/10 bg-white/5 hover:border-white/20
탭:     rounded-full px-3 py-1.5 text-xs border
인풋:   rounded-lg bg-white/5 border border-white/10 focus:border-white/25
```
