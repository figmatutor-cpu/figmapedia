/**
 * Separate Notion database configurations for each section.
 * These are child databases within Notion pages, separate from the main Q&A database.
 */

export const SECTION_DB_IDS = {
  /** 프롬프트 피디아 — child DB inside the "프롬프트 피디아" page */
  prompt: "287fdea8-0034-81e6-87b8-ce36c9329d55",

  /** 키오스크 리스트 — child DB inside the "키오스크 맛집탐방" page */
  kiosk: "78378389-9edb-4721-9763-1d38d8881654",

  /** UX/UI 아티클 — standalone DB */
  uxuiArticles: "f3eab373-ff92-4bb8-8e99-6a89c8373f60",

  /** 기술&디자인 블로그 — standalone DB */
  techBlogs: "7c751f06-80b9-4a72-b769-b1d20a843691",

  /** UXUI 용어집 — child DB inside column_list of "UXUI 용어집" page */
  uxuiTerms: "c042287e-f2d1-4ee6-bac9-062e5fc338a4",

  /** Mac 피그마 단축키 리스트 */
  macShortcuts: "11a4cfa7-90a1-4291-aa1c-646286b7b53d",

  /** Win 피그마 단축키 리스트 */
  winShortcuts: "df06f1d5-fca8-45bb-873f-c52ba79dd5bb",

  /** 유용한 피그마 플러그인 */
  plugins: "ddc8b180-7f6c-439a-ac53-3f51868d34db",
} as const;
