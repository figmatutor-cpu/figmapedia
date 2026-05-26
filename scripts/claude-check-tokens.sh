#!/usr/bin/env bash
# PostToolUse hook: 디자인 토큰 위반 검사
# - hex 색상 (#RGB, #RRGGBB)
# - Tailwind 기본 색상/사이즈 클래스 (bg-red-500, text-sm 등)
# 화이트리스트: 토큰 정의 파일 (globals.css 등)

set -u

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 대상 확장자만
case "$FILE_PATH" in
  *.tsx|*.ts|*.jsx|*.js|*.css|*.scss) ;;
  *) exit 0 ;;
esac

# 화이트리스트 (토큰 정의 파일)
case "$FILE_PATH" in
  */src/app/globals.css) exit 0 ;;
  */tokens/*) exit 0 ;;
  */theme.*) exit 0 ;;
esac

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

VIOLATIONS=""

# 1) hex 색상 검사 (#RRGGBB 또는 #RGB)
HEX_HITS="$(grep -nE '#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b' "$FILE_PATH" 2>/dev/null || true)"
if [ -n "$HEX_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}
[hex 색상 발견] var(--color-*) 토큰을 사용하세요:
${HEX_HITS}
"
fi

# 2) Tailwind 기본 색상 클래스 (예: bg-red-500, text-gray-700)
TW_COLOR_HITS="$(grep -nE '\b(bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|caret|accent|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+' "$FILE_PATH" 2>/dev/null || true)"
if [ -n "$TW_COLOR_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}
[Tailwind 기본 색상 클래스] 디자인 토큰 클래스를 사용하세요 (bg-glass-N, text-fg-N 등):
${TW_COLOR_HITS}
"
fi

# 3) Tailwind 기본 텍스트 사이즈 (text-xs/sm/base/lg/xl/...)
# JSX className 안에서만 잡도록 단순화: text-xs/sm/base/lg/xl/2xl 패턴
TW_SIZE_HITS="$(grep -nE '\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b' "$FILE_PATH" 2>/dev/null || true)"
if [ -n "$TW_SIZE_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}
[Tailwind 기본 텍스트 사이즈] 타이포 토큰을 사용하세요 (text-xxs 등 커스텀 토큰만 허용):
${TW_SIZE_HITS}
"
fi

if [ -n "$VIOLATIONS" ]; then
  printf 'DESIGN TOKEN 위반 in %s:%s\n' "$FILE_PATH" "$VIOLATIONS" >&2
  exit 2
fi

exit 0
