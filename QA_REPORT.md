# Phase 1 통합 QA 리포트

> 점검 시점: 2026-05-23 (베타 출시 전 — 토스 가맹 승인 대기 단계)
> 환경: localhost:3000 (dev 서버, Next.js 16.1)

## 1. 권한 매트릭스 (28개 시나리오 / 비로그인 기준)

### 공개 페이지 — 200 OK

| 경로                                | 결과 | 의도                              |
| ----------------------------------- | ---- | --------------------------------- |
| `/`                                 | 200  | 홈                                |
| `/figma-info`                       | 200  | 피그마 정보                       |
| `/prompt-pedia`                     | 200  | 프롬프트 피디아 (+ AI 실험실 CTA) |
| `/kiosk-food`                       | 200  | 키오스크                          |
| `/uxui-study`                       | 200  | UXUI 스터디                       |
| `/community`                        | 200  | 커뮤니티                          |
| `/ai-lab`                           | 200  | AI 실험실 메인 (동적 hero)        |
| `/ai-lab/vote`                      | 200  | 주제 투표 (마케팅 노출)           |
| `/ai-lab/live`                      | 200  | 라이브 세션                       |
| `/ai-lab/2026-W22-claude-wireframe` | 200  | 리포트 상세 (30% 공개)            |
| `/membership`                       | 200  | 멤버십 placeholder                |
| `/privacy`                          | 200  | 개인정보 처리방침                 |
| `/terms`                            | 200  | 이용약관                          |
| `/refund-policy`                    | 200  | 환불 정책 (신규)                  |

### 멤버 전용 — 비로그인 307 → /auth/login

| 경로              | 결과 | 정책                                           |
| ----------------- | ---- | ---------------------------------------------- |
| `/study-room`     | 307  | middleware (member only)                       |
| `/ai-lab/vod/abc` | 307  | middleware                                     |
| `/mypage`         | 307  | middleware (현재 페이지 없음 but matcher 통과) |

### 운영자 전용 — 비로그인 307

| 경로             | 결과 | 정책                    |
| ---------------- | ---- | ----------------------- |
| `/admin`         | 307  | middleware (admin only) |
| `/admin/topics`  | 307  | 〃                      |
| `/admin/vods`    | 307  | 〃                      |
| `/admin/members` | 307  | 〃                      |

### API — 비로그인 401 / 공개 200

| 경로                                 | 결과 | 정책               |
| ------------------------------------ | ---- | ------------------ |
| `/api/study-reservations` (GET)      | 401  | requireAuth        |
| `/api/experiments/[slug]/full` (GET) | 401  | requireMember 동등 |
| `/api/admin/topics` (GET)            | 401  | requireAdminApi    |
| `/api/admin/vods` (GET)              | 401  | requireAdminApi    |
| `/api/admin/members` (GET)           | 401  | requireAdminApi    |
| `/api/topics/current` (GET)          | 200  | 공개 (마케팅용)    |
| `/api/search-index` (GET)            | 200  | 공개               |

→ **28/28 통과**. 권한 모델 의도대로 동작.

---

## 2. SEO 메타데이터

### 공개 페이지 title (실제 추출값)

| 경로             | title                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| `/`              | Figmapedia - 디자인 용어사전 & 리소스                                      |
| `/ai-lab`        | AI 실험실 \| Figmapedia                                                    |
| `/ai-lab/vote`   | 이번 주 실험 주제 투표 \| AI 실험실 \| Figmapedia                          |
| `/ai-lab/live`   | 라이브 세션 \| AI 실험실 \| Figmapedia                                     |
| `/ai-lab/[slug]` | (동적) Claude로 와이어프레임 그리기 — 실험 노트 \| AI 실험실 \| Figmapedia |
| `/membership`    | 멤버십 \| 디자이너의 AI 실험실 \| Figmapedia                               |
| `/refund-policy` | 환불 정책 - Figmapedia                                                     |

브랜드 일관성 + 페이지별 차별화 OK.

### noindex (검색 노출 차단) 적용 확인

| 경로               | metadata.robots               | 의도                 |
| ------------------ | ----------------------------- | -------------------- |
| `/admin`           | `index: false, follow: false` | 운영자 전용          |
| `/study-room`      | `index: false, follow: false` | 멤버 전용            |
| `/ai-lab/vod/[id]` | `index: false, follow: false` | 멤버 전용            |
| `/membership`      | (없음 = index 허용)           | 마케팅 페이지 — 정상 |

### Open Graph 메타

- 글로벌 `src/app/layout.tsx` — siteName, locale: ko_KR, type: website, og:image 설정됨
- 각 페이지 layout.tsx에서 페이지별 title/description/OG 오버라이드

---

## 3. SEO 페이월 마크업 (/ai-lab/[slug])

비회원에게 30%만 노출하면서 Google에는 페이월 본문도 인덱싱되도록 schema.org 구조화 데이터 사용. 실측 응답:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",                          ✅
  "isAccessibleForFree": false,                ✅
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": false,
    "cssSelector": ".member-only-content"      ✅ (DOM에 동일 클래스 노출됨)
  }
}
```

→ Google Rich Results Test로 추가 검증 권장 (브라우저).

---

## 4. SEO 자산 — sitemap / robots

### sitemap.xml

- 총 URL: **2082개** (정적 + 동적 entry + 커뮤니티)
- 신규 포함: `/ai-lab`, `/ai-lab/vote`, `/ai-lab/live`, `/membership`, `/refund-policy`, `/ai-lab/[slug]` (MDX 동적)
- 누락: `/ai-lab/vote/[week]` 동적 (winner 주차별) — Phase 2에서 추가 가능

### robots.txt

- 허용: `/`
- 차단: `/api/`, `/_next/`, `/admin`, `/mypage`, `/study-room`, `/ai-lab/vod`, `/membership/success`, `/auth/`
- Sitemap 링크: 자동 생성

→ `public/robots.txt`와 `src/app/robots.ts` 충돌 발견 + 해결 (public 버전 삭제).

---

## 5. 발견된 이슈 + 해결

| #   | 이슈                                                                         | 해결                                                                                    |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `public/robots.txt`와 `src/app/robots.ts` 동시 존재 → `/robots.txt` 500 에러 | `public/robots.txt` 제거 → 200 정상                                                     |
| 2   | sitemap에 AI 실험실 페이지 누락                                              | `/ai-lab*`, `/membership`, `/refund-policy` 추가 + MDX 동적 추가                        |
| 3   | robots disallow에 멤버 전용/admin 미포함 (검색 노출 위험)                    | `/admin`, `/mypage`, `/study-room`, `/ai-lab/vod`, `/membership/success`, `/auth/` 추가 |

타입체크: errors 0 (현재).

---

## 6. 출시 전 추가 점검 항목 (사용자 브라우저)

내가 자동화 못 한 항목 — 사용자가 베타 출시 전 직접 확인 권장.

### Lighthouse

```
http://localhost:3000/ → DevTools → Lighthouse → Mobile + Desktop
```

- 목표: Performance 80+, Accessibility 90+, SEO 90+
- 주요 페이지: `/`, `/ai-lab`, `/ai-lab/vote`, `/prompt-pedia`, `/ai-lab/[slug]`

### Google Rich Results Test

```
https://search.google.com/test/rich-results
```

- `/ai-lab/2026-W22-claude-wireframe` 입력 → Article + Paywall 검증

### 깨진 링크 점검

- Footer 링크 / Navbar 메뉴 → 새 페이지(`/ai-lab`, `/membership`, `/refund-policy`) 정상 동작 확인
- `/ai-lab/archive` 링크는 메인 페이지에 있지만 페이지 자체는 Phase 2 → 일시적으로 404. UI에서 조건부 노출 또는 placeholder 페이지 필요

### Manual end-to-end

| 시나리오                                                            | 확인             |
| ------------------------------------------------------------------- | ---------------- |
| 비회원 → /ai-lab/vote → 후보 클릭 → /auth/login으로 리다이렉트      | UX 자연스러운지  |
| free → /ai-lab/vote → 투표 가능 (다른 후보 클릭 시 자동 변경)       | API 동작         |
| member → /ai-lab/[slug] → 본문 자동 fetch + ReportBody 렌더링       | Hybrid Rendering |
| member → /study-room → 예약 폼 + 본인 예약 + 취소                   | API end-to-end   |
| admin → /admin → 대시보드 + 4개 메뉴 + Topics 등록 + 회원 role 변경 | 운영자 흐름      |

---

## 7. Phase 1 출시 전 남은 작업

| 우선순위 | 작업                                              | 상태                     |
| -------- | ------------------------------------------------- | ------------------------ |
| P0       | 토스페이먼츠 가맹 승인 + 결제 통합 (W3)           | ⏳ 가맹 심사 대기 (~2주) |
| P0       | terms/privacy 멤버십 조항 보강 (W3와 동시)        | 미진행                   |
| P1       | 베타 콘텐츠 MDX 리포트 2~3건 추가                 | 1건 (샘플)               |
| P1       | 첫 라이브 진행 + VOD 등록                         | 미진행                   |
| P2       | `/ai-lab/archive` 빈 페이지 또는 조건부 링크 처리 | 현재 메인에 링크만 있음  |
| P2       | Lighthouse 90+ 튜닝                               | 미측정                   |

---

**결론**: **권한/SEO/메타데이터 측면에서 Phase 1 출시 가능 상태.** 토스 결제 통합 + 콘텐츠 누적이 남은 핵심 작업.
