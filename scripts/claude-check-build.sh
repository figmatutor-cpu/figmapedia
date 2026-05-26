#!/usr/bin/env bash
# Stop hook: 작업 종료 시 타입 체크
# 차단하지 않고 알림만 (exit 0)

set -u

# tsc 경로
if command -v npx >/dev/null 2>&1; then
  TSC="npx tsc"
elif [ -x "/opt/homebrew/bin/npx" ]; then
  TSC="/opt/homebrew/bin/npx tsc"
elif [ -x "/usr/local/bin/npx" ]; then
  TSC="/usr/local/bin/npx tsc"
else
  exit 0
fi

cd "$(dirname "$0")/.." || exit 0

OUT="$($TSC --noEmit --pretty false 2>&1)"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  printf '⚠️  TypeScript 에러 감지 (tsc --noEmit):\n%s\n' "$OUT" >&2
fi

exit 0
