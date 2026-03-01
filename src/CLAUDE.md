# 디자인 시스템 & 코딩 컨벤션

## 디자인 토큰 (globals.css 기반)

### 컬러

| 토큰 | 값 | 용도 |
|------|----|----|
| `bg-base` | `#050510` | 페이지 배경 |
| `brand-blue` | `#1f3dbc` | 브랜드 액센트 |
| `brand-blue-light` | `#f0f2ff` | 브랜드 라이트 |
| `navbar-bg` | `#1f1f1f57` | 네비게이션 반투명 배경 |
| `navbar-border` | `#333` | 네비게이션 테두리 |
| `glass-hero` | `rgba(15,15,20,0.55)` | 히어로 글래스 배경 |
| `glass-overlay` | `rgba(15,15,20,0.85)` | 오버레이 글래스 배경 |

### 글래스모피즘 패턴 (프로젝트 전반에서 반복 사용)

```
기본:     bg-white/5 border border-white/10
호버:     hover:border-white/20 hover:bg-white/[0.08]
카드:     rounded-xl overflow-hidden
활성탭:   bg-white/10 border-white/20 text-white
비활성탭: bg-white/[0.03] border-white/10 text-gray-400
```

### 타이포그래피

| 폰트 | CSS 변수 | 용도 |
|------|---------|------|
| Pretendard Variable | `--font-pretendard` | 기본 (한글 + 영문) |
| Geist Mono | `--font-geist-mono` | 코드, 단축키 |

### 텍스트 크기 (커스텀)

- `text-xxs`: 10px / line-height 1.4 — 탭 카운트, 보조 텍스트에 사용

### 브레이크포인트

| 이름 | 값 | 전환 대상 |
|------|----|----|
| `xl-nav` | `1080px` | 네비게이션 데스크탑/모바일, 필터 탭 표시/숨김 |
| 기본 | Tailwind 기본값 | sm(640), md(768), lg(1024), xl(1280) |

### 라운딩 & 간격

- 카드: `rounded-xl`, 패딩 `p-4`
- 버튼/탭: `rounded-full`, 패딩 `px-3 py-1.5`
- 인풋: `rounded-lg`
- shadcn 기본 radius: `0.625rem`

## Tailwind CSS 4 주의사항

```css
/* O — Tailwind 4 문법 */
bg-linear-to-br
/* X — Tailwind 3 문법, 사용 금지 */
bg-gradient-to-br
```

- `@theme inline { }` 블록에서 커스텀 변수 정의 (globals.css)
- oklch 컬러 스페이스 사용 (shadcn)

## 코딩 컨벤션

- `"use client"` — 클라이언트 컴포넌트/훅 상단에 반드시 명시
- Path alias: `@/` → `./src/` (tsconfig.json)
- 컴포넌트: named export (default export 미사용)
- 타입: `src/types/index.ts`에 중앙 관리
