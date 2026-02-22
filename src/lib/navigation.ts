export interface FilterConfig {
  titleKeywords?: string[];
  titleAllRequired?: string[];
  titleExclude?: string[];
  categoryMatch?: string[];
}

export interface SubTab {
  key: string;
  label: string;
  filter?: FilterConfig;
  /** If set, this sub-tab loads data from a separate Notion DB instead of filtering */
  sectionDataKey?: string;
  /** Filter items within the parent's sectionDataKey by category names (exact match) */
  categoryFilter?: string[];
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  subTabs?: SubTab[];
  defaultFilter?: FilterConfig;
  /** If set, this page loads all data from a separate Notion DB (no filtering) */
  sectionDataKey?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "figma-info",
    label: "피그마 정보",
    href: "/figma-info",
    subTabs: [
      {
        key: "figma-qa",
        label: "피그마 실무 Q&A",
        filter: {
          categoryMatch: [
            "기초 인터페이스",
            "프로토타이핑",
            "피그마 소식 업데이트",
            "베리어블",
            "컴포넌트",
            "피그마사이트",
            "오토 레이아웃",
            "피그마메이크",
            "피그마 슬라이드",
            "데브모드",
            "업데이트",
            "플러그인",
            "피그잼",
            "피그마버즈",
            "소소한 꿀팁",
          ],
        },
      },
      {
        key: "mac-shortcuts",
        label: "Mac 단축키",
        sectionDataKey: "mac-shortcuts",
      },
      {
        key: "win-shortcuts",
        label: "Win 단축키",
        sectionDataKey: "win-shortcuts",
      },
    ],
  },
  {
    key: "prompt-pedia",
    label: "프롬프트",
    href: "/prompt-pedia",
    sectionDataKey: "prompt",
    subTabs: [
      { key: "prompt-all", label: "전체" },
      { key: "prompt-kr", label: "한글자연어", categoryFilter: ["한글자연어"] },
      { key: "prompt-en", label: "영문자연어", categoryFilter: ["영문자연어"] },
      { key: "prompt-json", label: "JSON", categoryFilter: ["JSON"] },
      { key: "prompt-param", label: "파라미터형", categoryFilter: ["파라미터형"] },
      { key: "prompt-code", label: "코드", categoryFilter: ["코드"] },
    ],
  },
  {
    key: "kiosk-food",
    label: "키오스크",
    href: "/kiosk-food",
    sectionDataKey: "kiosk",
    subTabs: [
      { key: "kiosk-all", label: "전체" },
      { key: "kiosk-food-bev", label: "식음료", categoryFilter: ["식음료"] },
      { key: "kiosk-pos", label: "계산기&포스", categoryFilter: ["계산기&포스"] },
      { key: "kiosk-beauty", label: "뷰티", categoryFilter: ["뷰티"] },
      { key: "kiosk-info", label: "안내&검색", categoryFilter: ["안내&검색"] },
      { key: "kiosk-franchise", label: "프렌차이즈", categoryFilter: ["프렌차이즈"] },
      { key: "kiosk-mobility", label: "모빌리티", categoryFilter: ["모빌리티"] },
      { key: "kiosk-finance", label: "금융", categoryFilter: ["금융"] },
    ],
  },
  {
    key: "uxui-study",
    label: "UXUI디자인",
    href: "/uxui-study",
    subTabs: [
      {
        key: "uxui-articles",
        label: "UXUI 아티클",
        sectionDataKey: "uxui-articles",
      },
      {
        key: "uxui-blogs",
        label: "기술 & 디자인 블로그",
        sectionDataKey: "uxui-blogs",
      },
      {
        key: "uxui-terms",
        label: "UXUI 용어정리",
        sectionDataKey: "uxui-terms",
      },
    ],
  },
];

export const CTA_LINK = "https://open.kakao.com/o/gPjVAOXf";
export const CTA_LABEL = "오카방 참여하기";
