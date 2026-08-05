# [프로젝트명] 디자인 원칙

> 이 문서는 "왜 이렇게, 어떤 맥락에서" 디자인 토큰을 사용하는지를 정의합니다.
> 토큰 목록은 docs/design-tokens.md, 기술 규칙은 CLAUDE.md를 참조하세요.
> 디자인 판단이 필요할 때 이 문서를 읽으세요.

## 브랜드 성격

- 톤: [전문적이지만 딱딱하지 않음. 친근하지만 캐주얼하지 않음.]
- 키워드: [깔끔, 신뢰, 효율적]
- 참고: [Linear의 미니멀함 + Stripe의 정돈된 레이아웃]
  단, 색상과 폰트는 우리 브랜드 토큰을 사용

## 타이포그래피 사용 규칙

- 제목 계층은 4단계만: h1(30px) → h2(24px) → h3(20px) → h4(18px)
- 본문: text-base(16px), line-height 1.6
- 캡션/라벨: text-sm(14px), line-height 1.5
- Heading에만 semibold(600) 사용. 본문에 bold(700) 금지
- 밑줄은 링크에만 사용. 강조 목적 밑줄 금지
- 한 화면에 폰트 크기는 최대 4종류까지

## 색상 사용 맥락

- brand-primary는 CTA 버튼과 활성 링크에만 사용
- 한 화면에 brand-primary는 최대 2군데
- 상태 색상(success/error/warning)은 텍스트에 직접 쓰지 말 것
  → Badge 또는 Alert 컴포넌트로 감싸서 사용
- 배경은 최대 3단계: bg-primary → bg-secondary → bg-tertiary
  4단계 이상 중첩 금지
- 보더 색상은 border-default 하나만 사용
  강조가 필요하면 border-strong, 그 외 변형 금지

## 스페이싱 사용 맥락

- 4px 기반 체계 (xs:4, sm:8, md:12, lg:16, xl:24, 2xl:32)
- 컴포넌트 내부 padding: spacing-md(12px) 이상
- 같은 그룹의 요소 간 간격: spacing-sm(8px)
- 서로 다른 컴포넌트 간 간격: spacing-lg(16px)
- 섹션 간 간격: spacing-2xl(32px)
- spacing-xs(4px) 아래로 내려가지 않음

## 레이아웃 규칙

- 최대 너비: 1200px
- 사이드바: 240px 고정
- 모바일 브레이크포인트: 768px
- 그리드: 12컬럼, gap은 spacing-lg(16px)
- 컨텐츠 영역 좌우 padding: spacing-xl(24px)

## 컴포넌트 조합 규칙

- Card 안에 Card 중첩 금지
- Modal 안에는 최대 2개 버튼 (Primary + Ghost 조합)
- Modal 안에 Modal 금지
- Form 필드는 항상 세로 배치 (모바일 대응). 가로 나열 금지
- 테이블은 최대 6열. 그 이상이면 카드 리스트로 전환
- 리스트 아이템 내 액션 버튼은 최대 2개
- Toast/Alert는 화면에 동시 최대 3개

## 아이콘 규칙

- 기본 크기: 20px
- 허용 크기: 16px(소), 20px(중), 24px(대)
- 한 컴포넌트 안에서 아이콘 크기 혼용 금지
- 아이콘 색상은 텍스트 색상을 따름 (별도 색상 지정 금지)
- 장식용 아이콘 금지. 기능적 의미가 있을 때만 사용

## 인터랙션 규칙

- hover 트랜지션: 150ms ease
- 페이지 전환: 200ms ease
- 0.3초(300ms) 이상의 애니메이션 금지
- 로딩 상태는 Skeleton UI 사용 (spinner보다 선호)
- 비활성 요소: opacity 0.5 + cursor not-allowed

## 쓰지 말 것

- 그라데이션 배경
- 텍스트에 그림자 (text-shadow)
- 3px 이상의 border 두께
- 전체 너비 버튼 (모바일 제외)
- 둥근 프로필 이미지 외에 border-radius-full 사용
- 깜빡이는(blink) 애니메이션
- 자동 재생 비디오/오디오

## 변경 이력

- [날짜]: 초기 작성
