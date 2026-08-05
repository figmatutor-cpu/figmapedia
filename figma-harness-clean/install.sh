#!/bin/bash
# ============================================
# 하네스 설치 스크립트
# 사용법: bash install.sh /내/프로젝트/경로
# ============================================
set -e
PROJECT_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🎨 Figma → Code 하네스 설치"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "설치 경로: $(cd "$PROJECT_DIR" 2>/dev/null && pwd || echo "$PROJECT_DIR")"
echo ""

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

cp "$SCRIPT_DIR/CLAUDE.md" .
echo "✅ CLAUDE.md"

cp "$SCRIPT_DIR/figma-code-connect.json" .
echo "✅ figma-code-connect.json"

# claude-config → .claude 변환
mkdir -p .claude
cp -r "$SCRIPT_DIR/claude-config/"* .claude/
echo "✅ .claude/ (settings.json, hooks, commands, skills, agents)"

cp -r "$SCRIPT_DIR/scripts" .
echo "✅ scripts/"

cp -r "$SCRIPT_DIR/docs" .
echo "✅ docs/"

mkdir -p src/tokens
cp "$SCRIPT_DIR/src/tokens/"* src/tokens/
echo "✅ src/tokens/"

# .gitignore
if [ ! -f .gitignore ]; then
  echo ".claude/settings.local.json" > .gitignore
  echo "node_modules/" >> .gitignore
  echo "dist/" >> .gitignore
  echo "storybook-static/" >> .gitignore
  echo ".env" >> .gitignore
  echo "✅ .gitignore 생성"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 설치 완료!"
echo ""
echo "다음 단계:"
echo "  1. CLAUDE.md 열어서 [프로젝트명] 수정"
echo "  2. cd $(pwd) && claude"
echo "  3. Figma MCP 연결 (/mcp)"
echo "  4. 프로젝트 초기화 프롬프트 입력"
echo ""
