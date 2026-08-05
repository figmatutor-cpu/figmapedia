# team-notes — 빌더 간 mailbox (로컬 전용, gitignored)

서브에이전트들은 stateless이므로 직접 통신 불가 → 메인(오케스트레이터)이 mailbox 역할.
각 빌더는 작업 결과/발견 사항을 본인 파일에 markdown으로 기록.

## 파일 규칙

- `layout-architect.md` — 셸/네비/라우팅 결정, 다른 빌더가 따라야 할 규칙
- `page-builder-a.md` — 홈 + 피그마 정보 진행 상황, 막힌 점, 발견 패턴
- `page-builder-b.md` — 프롬프트 페디아 + UXUI
- `page-builder-c.md` — 키오스크 + 커뮤니티 + 리소스
- `shared-patterns.md` — 빌더가 발견한 중복 패턴 (메인이 컴포넌트로 승격 결정)
- `integration-qa-feedback.md` — QA가 빌더에게 돌려보낼 피드백

## 작성 원칙

- 시간 역순 (최신 항목이 위)
- 항목당: 날짜 · 작성자 · 내용 · 다른 빌더가 알아야 할 점
- 결정 사항은 굵게 표시
