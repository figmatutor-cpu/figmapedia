# HuddlingClub Design

## Direction

밝은 사무실에서 교육 파트너를 검토하는 실무자와 팀 리더를 위한, 워크숍 작업 문서처럼 명료한 브랜드 홈. 차콜과 중립적인 종이색을 사용하고, 넓은 여백과 타이포그래피로 업무 개선의 메시지를 전달한다.

## Typography

로컬 Pretendard Variable을 사용한다. 한국어 제목은 자간을 좁히고 22–64px의 반응형 크기로 구성한다. 본문은 14–17px, 행간은 1.8–1.9로 유지한다. 단어 단위 줄바꿈을 사용한다. 히어로는 중앙 정렬하며, “디자이너와 IT 실무자를 위한 AI 업무혁신 교육”을 고정 H1으로 표시한다. Figma · Claude · ChatGPT · MCP · 바이브코딩을 실무 워크플로우에 연결한다는 설명을 붙인다.

## Home palette

- Paper: `oklch(0.979 0 250)`
- Ink: `oklch(0.235 0 260)`
- Muted text: `oklch(0.47 0 260)`
- Accent: `#202020`
- Divider: `oklch(0.86 0 255)`

홈 스타일은 CSS Modules로 한정한다. 기존 자료실의 다크 테마와 검색 컴포넌트는 유지한다.

## Layout and components

최대 콘텐츠 폭 1280px, 데스크톱 좌우 여백 6vw, 모바일 22px. 홈은 소개 → 주요 교육 기관 → 접근 방식 → 교육·컨설팅 영역 → 강의 이력 → 진행 방식 → 자료실 → 문의 순서다. 동일한 카드 나열 대신 구분선과 행 구조를 사용한다. 교육 이력은 어두운 배경과 밝은 텍스트로 강조하고, 100개 조직 이력을 제목에 표시한다. 전체 목록은 항상 펼쳐두며 검색·분야 필터와 페이지당 최대 10개 기록, 이전·다음 버튼과 현재 페이지 표시를 제공한다. 검색이나 분야 변경 시 첫 페이지로 돌아간다. 문의 CTA는 https://tally.so/r/ZjJQry 로 연결한다. 메뉴의 실무자료실은 huddling.ai, 바로 옆 커뮤니티는 huddling.club으로 같은 탭에서 이동한다. Figmatutor 소개는 sites/figmatutor의 독립 정적 배포로 제공한다.

## Accessibility

44px 이상의 주요 클릭 영역, 명확한 키보드 포커스, 본문 바로가기, 모바일 메뉴의 상태 전달과 Escape 닫기, 이력 필터의 선택 상태, 검색 결과 수 알림을 제공한다. 히어로 제목은 움직임 없이 표시하며 모바일에서도 단어 단위로 줄바꿈한다.

## Lecture data

원본은 프로젝트 루트의 `figmatutor_lectures.csv`다. `python3 scripts/sync-lectures.py`로 `src/data/lectures.json`을 갱신한다. 강의 진행 100개 조직 기록과 명시적인 커리큘럼 자문 1건을 반영했다. 문의·미팅은 실적에 포함하지 않는다. 기관 이름, 시기, 횟수·과정 단위는 원본을 유지한다. 강의명과 기관별 주제, 성과 수치, 만족도는 원본에 없으므로 추정하지 않는다. 근거 소스에 적힌 개인 메일·캘린더 정보는 공개 데이터에 포함하지 않는다.

## Education detail

`/education/ai-workflow`는 메인 첫 교육 제목에서 연결한다. 제목 → Figma 원본 강의 이미지 → 소개 → 7시간 기본 커리큘럼 → 대상·산출물 → 문의 순서로 구성한다. 커리큘럼은 Figma `bMenbRUNWUhOuCF4wHMWK2`, 노드 `30:842`를 바탕으로 컨텍스트 문서, 역할별 에이전트 4종, CLAUDE.md 연결·검증 과정을 설명한다. 대상·산출물은 `src/components/home/programs.ts`를 메인과 공유한다. 상세 페이지는 데스크톱 최대 1120px, 태블릿 좌우 40px, 모바일 좌우 20px을 사용한다. 문의 링크는 기존 Tally 폼을 사용한다.

## Search and answer content

홈의 교육 FAQ는 강사 선택, 기업·직무별 교육, Figma AI·MCP, Claude Code, 바이브코딩의 대상과 범위를 설명한다. 공개 FAQ와 figmatutor.info 홈의 JSON-LD는 education-content.ts를 공유한다. 추천 순위나 성과를 만들어 넣지 않으며 실제 강의 이력과 커리큘럼으로 연결한다.

## Team collaboration detail

`/education/team-collaboration`는 메인 세 번째 교육에서 연결한다. Figma `bMenbRUNWUhOuCF4wHMWK2`, 섹션 `29:243`의 3부 구성을 교육 커리큘럼으로 정리했다. 원본 이미지 `29:310`은 `public/images/education/team-collaboration.png`로 보관한다. 에이전트 설정 → Discord·Obsidian·GitHub 지식 공유 → Gmail·Google Calendar·Fireflies 연결 순서다. 원문에 교육 시간이 없어 시간은 협의로 표시한다. 기존 상세 페이지의 스타일과 문의 동선을 재사용한다.
