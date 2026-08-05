/* sample data — Korean Figma content */

const QA_ITEMS = [
  {
    id: 1,
    cat: "오토 레이아웃",
    title: "오토 레이아웃에서 패딩과 갭의 차이는 무엇인가요?",
    preview:
      "패딩은 컨테이너의 안쪽 여백, 갭은 자식 요소들 사이의 간격을 의미해요. Frame 단위에 적용되며 Shift+A로 빠르게 켤 수 있습니다.",
    author: "@figma_tutor",
    date: "2026.03.12",
    read: "4분",
    views: "2.3k",
    aiMatched: true,
  },
  {
    id: 2,
    cat: "기초 인터페이스",
    title: "선택한 레이어 그룹화하기",
    shortcut: "⌘ + G",
    author: "@bibibi_designer",
    date: "2026.03.10",
    views: "8.1k",
  },
  {
    id: 3,
    cat: "컴포넌트",
    title: "선택한 프레임을 컴포넌트로 변환",
    shortcut: "⌥ + ⌘ + K",
    author: "@kimdae",
    date: "2026.03.08",
    views: "12.4k",
  },
  {
    id: 4,
    cat: "플러그인",
    title: "한글 더미 텍스트 — 'Lorem Ipsum 한글'",
    preview: "한국어 더미 텍스트를 빠르게 채우는 플러그인. 인스톨 12,400회.",
    author: "minki.kim",
    date: "2026.02.28",
    read: "2분",
    views: "5.6k",
  },
  {
    id: 5,
    cat: "베리어블",
    title: "다크/라이트 모드 토큰 한 번에 만드는 법",
    preview:
      "베리어블 컬렉션을 만들고 모드를 추가하면, 같은 토큰이 모드별로 다른 값을 갖도록 설정할 수 있어요.",
    author: "@siwon_designer",
    date: "2026.02.25",
    read: "6분",
    views: "9.2k",
    aiMatched: true,
  },
  {
    id: 6,
    cat: "프로토타이핑",
    title: "스마트 애니메이트 — 똑같은 이름의 레이어가 부드럽게 이어지는 비결",
    preview:
      "동일한 이름·계층의 레이어 사이에는 자동으로 모션 보간이 일어나요. 변형의 명명 규칙이 핵심.",
    author: "@figma_tutor",
    date: "2026.02.22",
    read: "5분",
    views: "4.4k",
  },
  {
    id: 7,
    cat: "데브모드",
    title: "Dev Mode에서 컴포넌트 코드 추출하기",
    shortcut: "⇧ + D",
    author: "@kimdae",
    date: "2026.02.20",
    views: "6.7k",
  },
  {
    id: 8,
    cat: "오토 레이아웃",
    title: "Min/Max width 활용 패턴 5가지",
    preview: "반응형 컴포넌트의 핵심. 자주 쓰는 패턴을 한 번에 정리.",
    author: "@bibibi_designer",
    date: "2026.02.18",
    read: "8분",
    views: "11.3k",
  },
];

const PROMPTS = [
  {
    id: "p1",
    cat: "한글자연어",
    title: "온보딩 화면 와이어프레임 생성",
    body: "회원가입 직후 보여줄 3단계 온보딩 화면을 와이어프레임 수준으로 만들어줘. 각 단계는 헤더·일러스트 자리·설명·CTA로 구성.",
  },
  {
    id: "p2",
    cat: "JSON",
    title: "디자인 토큰 — 컬러 팔레트",
    body: '{ "color": { "primary": "{...}", "neutral": "{...}" } }',
  },
  {
    id: "p3",
    cat: "영문자연어",
    title: "iOS-style settings list",
    body: "Generate an iOS-style settings list with grouped sections, chevrons, toggles, and SF Pro typography.",
  },
  {
    id: "p4",
    cat: "파라미터형",
    title: "{브랜드명} 랜딩 hero 만들기",
    body: "{브랜드명}의 가치 제안과 함께 hero 섹션을 만들어줘. 톤: {톤}, 컬러: {primary}.",
  },
];

const KIOSKS = [
  { id: "k1", cat: "식음료", brand: "스타벅스", screens: 14, hue: 142 },
  { id: "k2", cat: "식음료", brand: "버거킹", screens: 22, hue: 12 },
  { id: "k3", cat: "프렌차이즈", brand: "교촌치킨", screens: 18, hue: 25 },
  { id: "k4", cat: "뷰티", brand: "올리브영", screens: 9, hue: 95 },
  { id: "k5", cat: "안내&검색", brand: "현대백화점", screens: 11, hue: 220 },
  { id: "k6", cat: "모빌리티", brand: "카카오T", screens: 8, hue: 50 },
  { id: "k7", cat: "금융", brand: "신한은행", screens: 16, hue: 215 },
  { id: "k8", cat: "계산기&포스", brand: "본도시락", screens: 12, hue: 340 },
];

const POSTS = [
  {
    id: "c1",
    cat: "소소한 꿀팁",
    title: "Figma 듀얼 모니터 사용할 때 진짜 편한 단축키 3가지",
    author: "@figma_tutor",
    replies: 24,
    likes: 132,
    date: "2일 전",
  },
  {
    id: "c2",
    cat: "이벤트",
    title: "[모집] 4월 디자인 시스템 스터디 — 주 1회 줌",
    author: "@bibibi_designer",
    replies: 56,
    likes: 89,
    date: "5일 전",
  },
  {
    id: "c3",
    cat: "피그마버즈",
    title: "Config 2026 — 발표 라인업 보고 가장 기대되는 세션은?",
    author: "@kimdae",
    replies: 87,
    likes: 201,
    date: "1주 전",
  },
  {
    id: "c4",
    cat: "데일리콘텐츠",
    title: "오늘 만난 디자인 — 토스 송금 화면 마이크로 인터랙션 분석",
    author: "@siwon_designer",
    replies: 18,
    likes: 64,
    date: "1주 전",
  },
];

const ARTICLES = [
  {
    id: "a1",
    cat: "Figma A to Z",
    title: "Auto Layout — 처음부터 끝까지",
    read: "12분",
    date: "2026.03.20",
  },
  {
    id: "a2",
    cat: "Figma A to Z",
    title: "Variables — 토큰 설계의 모든 것",
    read: "18분",
    date: "2026.03.15",
  },
  {
    id: "a3",
    cat: "Figma A to Z",
    title: "Components 2.0 — 슬롯과 베리어블",
    read: "10분",
    date: "2026.03.08",
  },
];

const RESOURCES = [
  {
    id: "r1",
    cat: "템플릿",
    title: "사업계획서 슬라이드 템플릿 (60p)",
    downloads: "2,840",
  },
  {
    id: "r2",
    cat: "템플릿",
    title: "디자인 시스템 스타터 키트",
    downloads: "5,121",
  },
  {
    id: "r3",
    cat: "리소스",
    title: "한국형 UI 컴포넌트 라이브러리",
    downloads: "9,402",
  },
  {
    id: "r4",
    cat: "리소스",
    title: "iOS 26 Liquid Glass 무드보드",
    downloads: "1,203",
  },
];

const SUGGESTIONS = [
  "오토 레이아웃",
  "컴포넌트 만들기",
  "베리어블 사용법",
  "프로토타이핑 단축키",
  "피그잼 협업",
  "Dev Mode 사용법",
];

window.DATA = {
  QA_ITEMS,
  PROMPTS,
  KIOSKS,
  POSTS,
  ARTICLES,
  RESOURCES,
  SUGGESTIONS,
};
