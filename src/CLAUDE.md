# 디자인 시스템 & 코딩 컨벤션

## 디자인 토큰 (globals.css 기반)

### 컬러

| 토큰               | 값                    | 용도                   |
| ------------------ | --------------------- | ---------------------- |
| `bg-base`          | `#050510`             | 페이지 배경            |
| `brand-blue`       | `#1f3dbc`             | 브랜드 액센트          |
| `brand-blue-light` | `#f0f2ff`             | 브랜드 라이트          |
| `navbar-bg`        | `#1f1f1f57`           | 네비게이션 반투명 배경 |
| `navbar-border`    | `#333`                | 네비게이션 테두리      |
| `glass-hero`       | `rgba(15,15,20,0.55)` | 히어로 글래스 배경     |
| `glass-overlay`    | `rgba(15,15,20,0.85)` | 오버레이 글래스 배경   |

### 글래스/보더 토큰 (Renewal · Phase 1)

> 새 코드는 반드시 아래 토큰만 사용. `bg-white/X`, `border-white/X` 같은 임의 알파값 **금지**.

**글래스 4단계** (`--fp-glass-*` → Tailwind `bg-glass-N`)

| 클래스       | 알파 (dark) | 용도                               |
| ------------ | ----------- | ---------------------------------- |
| `bg-glass-1` | `0.03`      | 가장 은은한 면 · 비활성탭 · subtle |
| `bg-glass-2` | `0.07`      | 카드/패널 기본                     |
| `bg-glass-3` | `0.10`      | hover · 활성탭                     |
| `bg-glass-4` | `0.18`      | 강조 (selected, focus, modal head) |

**보더 3단계** (`--fp-border-*` → Tailwind `border-border-N`)

| 클래스            | 알파 (dark) | 용도                       |
| ----------------- | ----------- | -------------------------- |
| `border-border-1` | `0.10`      | 기본 카드/구분선           |
| `border-border-2` | `0.18`      | hover · 활성               |
| `border-border-3` | `0.28`      | 강조 (focus, modal, error) |

**표준 패턴**

```
카드(기본):   rounded-xl border border-border-1 bg-glass-2
카드(hover):  hover:border-border-2 hover:bg-glass-3
활성탭:       bg-glass-3 border-border-2 text-white
비활성탭:     bg-glass-1 border-border-1 text-gray-400
인풋:         rounded-lg bg-glass-1 border border-border-1 focus:border-border-3
```

> Light 모드는 `[data-theme="light"]` 가 globals.css 에서 자동으로 `--fp-glass-*`, `--fp-border-*` 알파를 swap 합니다. 컴포넌트는 동일 클래스만 쓰면 됨.

### 타이포그래피

| 폰트                | CSS 변수            | 용도               |
| ------------------- | ------------------- | ------------------ |
| Pretendard Variable | `--font-pretendard` | 기본 (한글 + 영문) |
| Geist Mono          | `--font-geist-mono` | 코드, 단축키       |

### 텍스트 크기 (커스텀)

- `text-xxs`: 10px / line-height 1.4 — 탭 카운트, 보조 텍스트에 사용

### 브레이크포인트

| 이름     | 값              | 전환 대상                                     |
| -------- | --------------- | --------------------------------------------- |
| `xl-nav` | `1080px`        | 네비게이션 데스크탑/모바일, 필터 탭 표시/숨김 |
| 기본     | Tailwind 기본값 | sm(640), md(768), lg(1024), xl(1280)          |

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
