export const CATEGORY_COLORS: Record<string, string> = {
  "기초 인터페이스": "bg-yellow-500/15 text-yellow-400",
  "베리어블": "bg-gray-500/15 text-gray-400",
  "피그잼": "bg-purple-500/15 text-purple-400",
  "피그마 소식 업데이트 ": "bg-blue-500/15 text-blue-400",
  "데일리콘텐츠": "bg-violet-500/15 text-violet-400",
  "소소한 꿀팁": "bg-pink-500/15 text-pink-400",
  "플러그인": "bg-green-500/15 text-green-400",
  "프로토타이핑": "bg-orange-500/15 text-orange-400",
  "컴포넌트": "bg-red-500/15 text-red-400",
  "오토 레이아웃 ": "bg-amber-500/15 text-amber-400",
  "데브모드": "bg-orange-500/15 text-orange-400",
  "피그마사이트": "bg-blue-500/15 text-blue-400",
  "피그마 슬라이드": "bg-yellow-500/15 text-yellow-400",
  "이벤트": "bg-pink-500/15 text-pink-400",
  "업데이트": "bg-amber-500/15 text-amber-400",
  "피그마메이크": "bg-gray-500/15 text-gray-400",
  "피그마버즈": "bg-pink-500/15 text-pink-400",
  "리소스": "bg-emerald-500/15 text-emerald-400",
  "템플릿": "bg-yellow-500/15 text-yellow-400",
  "수업자료": "bg-cyan-500/15 text-cyan-400",
  "주간 라이브": "bg-rose-500/15 text-rose-400",
  "Figma A to Z": "bg-indigo-500/15 text-indigo-400",
};

export const DEFAULT_CATEGORY_COLOR = "bg-gray-500/15 text-gray-400";

// 검색 UI
export const SEARCH_PLACEHOLDER = "검색어를 입력하세요 ";
export const AI_SEARCH_LABEL = "AI 검색";
export const AI_SEARCHING_MESSAGE = "AI가 관련 콘텐츠를 찾고 있어요...";
export const AI_SUMMARY_LABEL = "AI 요약";
export const FALLBACK_RESULTS_MESSAGE = "키워드 검색 결과를 대신 보여드립니다.";

// 섹션 설명
export const SECTION_DESCRIPTIONS: Record<string, string> = {
  "figma-info": "피그마 용어, 단축키, 플러그인 정보를 확인하세요",
  "kiosk-food": "검색해도 찾기 힘든 귀한 키오스크 스크린샷을 확인해보세요",
  "prompt-pedia": "좋은 아웃풋을 얻을 수 있는 프롬프트를 확인해보세요",
  "uxui-study": "UXUI 디자인 학습 리소스를 모아봤어요",
};

// 타이핑 애니메이션
export const TYPING_ANIMATION = {
  typeSpeed: 70,
  deleteSpeed: 40,
  pauseAtEnd: 1200,
  pauseBetween: 500,
} as const;

// AI 검색 추천 링크 (키워드 매칭 시 결과 하단에 표시)
export interface RecommendedLink {
  title: string;
  url: string;
}

export interface KeywordRecommendation {
  keywords: string[];
  links: RecommendedLink[];
}

export const KEYWORD_RECOMMENDATIONS: KeywordRecommendation[] = [
  {
    keywords: [
      "템플릿", "무료 템플릿", "피피티", "ppt", "파워포인트",
      "사업계획서", "슬라이드", "피피티 디자인", "ppt디자인",
    ],
    links: [
      { title: "피그마 슬라이드 템플릿 1", url: "https://www.figmapedia.co.kr/slide/?idx=5" },
      { title: "피그마 슬라이드 템플릿 2", url: "https://www.figmapedia.co.kr/slide/?idx=2" },
    ],
  },
  {
    keywords: [
      "이벤트페이지", "이벤트 페이지", "랜딩페이지", "랜딩 페이지",
      "랜딩페이지 디자인", "랜딩", "이벤트",
    ],
    links: [
      { title: "랜딩페이지 템플릿", url: "https://www.figmapedia.co.kr/landing/?idx=1" },
      { title: "이벤트 페이지 템플릿 - 행운의 포춘쿠키", url: "https://www.figmapedia.co.kr/event/?idx=4" },
      { title: "이벤트 페이지 템플릿 - 크리스마스 어드벤트 캘린더", url: "https://www.figmapedia.co.kr/all/?idx=3" },
    ],
  },
];

export function getRecommendedLinks(query: string): RecommendedLink[] {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const matched: RecommendedLink[] = [];
  for (const rec of KEYWORD_RECOMMENDATIONS) {
    if (rec.keywords.some((kw) => q.includes(kw.toLowerCase().replace(/\s+/g, "")))) {
      matched.push(...rec.links);
    }
  }
  return matched;
}

// 히어로 검색 제안
export const SEARCH_SUGGESTIONS = [
  "오토 레이아웃",
  "컴포넌트 만들기",
  "베리어블 사용법",
  "프로토타이핑 팁",
  "플러그인 추천",
  "피그마에서 정렬하는 방법은?",
  "디자인 시스템 구축 관련 팁",
];
