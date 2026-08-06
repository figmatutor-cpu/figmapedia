# 디자인 토큰 매핑 테이블

> Figma 변수명 ↔ CSS custom property 매핑.
> Claude Code가 Figma 디자인 구현 시 이 문서를 참조합니다.
> 토큰 추가/변경 시 이 문서도 업데이트하세요.

## 네이밍 규칙

Figma `/` → CSS `-` 변환. 예: `color/bg/primary` → `--color-bg-primary`

## 색상

| Figma 변수명         | CSS Property           | 값      | 용도        |
| -------------------- | ---------------------- | ------- | ----------- |
| color/bg/primary     | --color-bg-primary     | #ffffff | 주요 배경   |
| color/bg/secondary   | --color-bg-secondary   | #f9fafb | 보조 배경   |
| color/text/primary   | --color-text-primary   | #111827 | 주요 텍스트 |
| color/text/secondary | --color-text-secondary | #6b7280 | 보조 텍스트 |
| color/border/default | --color-border-default | #e5e7eb | 기본 보더   |
| color/brand/primary  | --color-brand-primary  | #3b82f6 | 브랜드 메인 |
| color/status/success | --color-status-success | #22c55e | 성공        |
| color/status/error   | --color-status-error   | #ef4444 | 에러        |

## 스페이싱

| Figma 변수명 | CSS Property | 값   |
| ------------ | ------------ | ---- |
| spacing/xs   | --spacing-xs | 4px  |
| spacing/sm   | --spacing-sm | 8px  |
| spacing/md   | --spacing-md | 12px |
| spacing/lg   | --spacing-lg | 16px |
| spacing/xl   | --spacing-xl | 24px |

## Claude용 규칙

1. Figma MCP가 hex 색상 반환 → 이 테이블에서 찾아서 `var(--color-*)` 사용
2. Figma가 스페이싱 숫자 반환 → `var(--spacing-*)` 매핑
3. 테이블에 없는 값 → 새 변수 만들지 말고 `/* ⚠️ 누락된 토큰 */` 플래그
