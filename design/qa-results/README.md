# qa-results — integration-qa 결과 보관

## 파일 규칙

- `gate-2-{page}.md` — 각 페이지 빌더 완료 직후 검증 결과
- `gate-3-final.md` — 모든 페이지 완료 후 통합 일관성 검증
- `a11y-{page}.md` — 접근성 점검 결과 (필요 시)

## 결과 포맷

```markdown
# Gate X — {페이지명}

- 빌드: PASS / FAIL
- 디자인 토큰 미사용 헥스: 0건 / N건
- Tailwind 기본 클래스 사용: 0건 / N건
- 접근성 (alt, aria, 키보드): PASS / FAIL
- 페이지 간 일관성: PASS / FAIL

## 발견 사항

- ...

## 빌더에게 피드백

team-notes/page-builder-{X}.md 에 전달
```
