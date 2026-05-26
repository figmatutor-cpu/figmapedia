# Figmapedia Renewal - AI Context Document

> 이 문서는 AI(Claude)가 프로젝트를 빠르게 이해하기 위한 컨텍스트 파일입니다.
> 상세 내용은 각 폴더의 CLAUDE.md를 참조하세요.

---

## AI 필수 체크리스트 (코드 작성 전 반드시 확인)

> **이 체크리스트를 건너뛰고 코드를 작성하면 안 됩니다.**

1. **이해 확인** — 문제/요청이 명확한가? 불분명하면 질문
2. **원인 분석** — 추측이 아닌 실제 코드 확인. 가설은 "가설"로 명시
3. **작업 계획 보고** — 아래 템플릿으로 보고 후 승인 받기
4. **승인 후 실행** — 승인 없이 코드 작성 금지
5. **완료 검증** — `npm run build` 통과 + 동작 테스트

### 작업 계획 보고 템플릿

```
문제 상황: 현재 어떤 문제가 있는지
목표: 작업 완료 시 기대 상태
원인 분석: 검증된 원인만 기술

변경 예정 파일:
| 파일 경로 | 변경 내용 | 비고 |

Before -> After:
[Before] 현재 상태 → [After] 기대 상태

이대로 진행해도 될까요?
```

### 금지 사항

| 금지                            | 이유                                |
| ------------------------------- | ----------------------------------- |
| 허락 없이 새 파일/컴포넌트 생성 | 프로젝트 구조 임의 변경 방지        |
| 기존 아키텍처 임의 변경         | 설계 의도 훼손 방지                 |
| 요청 범위 밖 리팩토링           | 스코프 크립 방지                    |
| 문제 발견 시 바로 수정          | 사용자가 다른 해결책을 원할 수 있음 |
| .env.example 생성/수정          | .env.local에서 직접 관리            |

---

## 운영 모드 (Interactive vs Auto)

### Interactive 모드 (기본)

위의 4단계 계획 보고 → 사용자 승인 → 실행을 그대로 따른다.

### Auto 모드

사용자가 명시적으로 다음 중 하나를 표명한 경우 적용:

- 하네스가 auto-accept(자동 승인) 모드로 가동 중
- "그냥 진행", "auto", "알아서 해" 등의 지시
- 사전에 합의된 반복 작업의 후속 실행

Auto 모드 규칙:

1. **계획 보고 생략, 즉시 실행** — 단, 작업 의도를 한 줄로 선언
2. **작업 종료 시 리포트 필수** — 변경 파일 목록 + 빌드/토큰 체크 결과
3. **다음 작업은 Auto 모드여도 사전 확인 필수** (위반 시 즉시 중단)
   - 배포: `npx vercel --prod`, `git push` (특히 `--force`)
   - 의존성 변경: `npm install`, `npm uninstall`
   - 파일/폴더 대량 삭제, 광범위 리팩토링
   - DB 마이그레이션: `supabase apply_migration`, `execute_sql` 쓰기
   - `.env*` 파일 직접 수정
   - 외부에 영향: PR/이슈 생성·코멘트, 외부 서비스 호출

> 위험 작업 대부분은 하네스 permissions 의 `ask`/`deny` 로 강제됨.
> 그래도 Auto 모드 모델은 "지금 이게 위험 작업인가?" 를 항상 자가 점검.

### 자동 가드레일 (하네스 hooks)

- `PostToolUse` (Write/Edit) — `scripts/claude-check-tokens.sh`
  hex 색상 / Tailwind 기본 클래스 사용 시 exit 2 로 차단
- `Stop` — `scripts/claude-check-build.sh`
  `tsc --noEmit` 결과를 stderr 로 보고 (차단하지 않음)

---

## 프로젝트 개요

**Figmapedia** — 피그마(Figma) 디자인 도구 한국어 지식 베이스

> 도메인: `figmapediarenewal.vercel.app`
> GitHub: https://github.com/figmatutor-cpu/figmapedia

```
Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS 4
Notion API (@notionhq/client) + Gemini 2.5 Flash (@google/generative-ai)
Fuse.js (퍼지 검색) + Three.js (히어로 웨이브) + GSAP
Vercel (Hobby) — npx vercel --prod 수동 배포
```

---

## 아키텍처

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

---

## 폴더별 컨텍스트 안내

| 폴더              | CLAUDE.md 내용                                    |
| ----------------- | ------------------------------------------------- |
| `src/`            | 디자인 시스템 토큰, Tailwind 4 규칙, 코딩 컨벤션  |
| `src/app/`        | 페이지 라우트, API 엔드포인트, 캐싱 규칙          |
| `src/components/` | 컴포넌트 아키텍처, 카드 패턴, iOS 대응, 검색 계층 |
| `src/lib/`        | Notion DB 매핑, 캐싱 전략, Gemini API, 네비게이션 |
| `src/hooks/`      | 훅 역할, 검색/썸네일/섹션 데이터 흐름             |

---

## 환경 변수

```
NOTION_API_KEY          — Notion Integration 토큰
NOTION_DATABASE_ID      — 메인 Q&A 데이터베이스 ID
GEMINI_API_KEY          — Google Gemini API 키
REVALIDATION_SECRET     — Notion webhook 인증 토큰
NEXT_PUBLIC_SITE_URL    — 사이트 URL (로컬: http://localhost:3000)
```

- `.env.local`에서 직접 관리
- Vercel: `npx vercel env add <NAME> production`

---

## 배포 플로우

```bash
git add <files> && git commit -m "message" && git push origin main
npx vercel --prod
```

### 커밋 메시지 컨벤션

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
perf: 성능 개선
docs: 문서 수정

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 트러블슈팅

### Notion 데이터 미반영

1. Notion 자동화(webhook) 동작 확인
2. `curl -X POST` revalidate 엔드포인트 직접 테스트
3. Vercel 환경 변수 REVALIDATION_SECRET 확인 (줄바꿈/공백 주의)

### AI 검색 실패

1. Gemini API 키 유효성 확인
2. 모델명 `gemini-2.5-flash` 확인 (다른 모델 404)
3. Rate limit (429) → Tier 1 이상 필요

### 모바일 키보드 내림

1. 검색 input unmount/remount 여부 확인
2. CSS 위치 전환이 bottom만 사용하는지 확인
3. font-size 16px 이상 확인

---

**Last Updated**: 2026-03-01
**Version**: 2.0.0
**Project**: Figmapedia Renewal
