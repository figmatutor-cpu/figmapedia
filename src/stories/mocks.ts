import type { SearchIndexItem } from "@/types";
import type { FigmaResource } from "@/lib/resource-data";

/**
 * Storybook 전용 mock 데이터.
 * 썸네일은 public/ 로컬 이미지를 사용해 Notion/OG API 호출 없이 렌더링한다.
 */
export const MOCK_THUMBNAIL = "/images/resources/ir-deck-seed.png";
export const MOCK_THUMBNAIL_WIDE = "/images/resources/ir-deck-series-a.png";

export const mockEntry: SearchIndexItem = {
  id: "mock-entry-1",
  title: "오토 레이아웃으로 반응형 카드 만들기",
  categories: ["오토 레이아웃 ", "소소한 꿀팁"],
  author: "피그마튜터",
  link: null,
  publishedDate: "2026-09-15",
  thumbnail: MOCK_THUMBNAIL,
};

export const mockLongTitleEntry: SearchIndexItem = {
  ...mockEntry,
  id: "mock-entry-2",
  title:
    "베리어블과 컴포넌트 프로퍼티를 조합해 라이트·다크 모드를 한 번에 전환하는 디자인 시스템 구축 가이드",
  categories: ["베리어블", "컴포넌트", "플러그인"],
};

export const mockShortcutEntry: SearchIndexItem = {
  id: "mock-shortcut-1",
  title: "오토 레이아웃 추가",
  categories: [],
  author: "",
  link: null,
  publishedDate: null,
  shortcut: "Shift + A",
};

export const mockGlossaryEntry: SearchIndexItem = {
  id: "mock-glossary-1",
  title: "Constraints",
  categories: ["기초 인터페이스"],
  author: "제약 조건 — 부모 프레임 크기가 바뀔 때 레이어가 반응하는 방식",
  link: null,
  publishedDate: null,
};

export const mockResource: FigmaResource = {
  title: "시드 투자 IR 덱 템플릿",
  url: "https://www.figma.com/community",
  category: "template",
  thumbnail: MOCK_THUMBNAIL,
};

export const mockCategories = [
  "기초 인터페이스",
  "오토 레이아웃 ",
  "컴포넌트",
  "베리어블",
  "프로토타이핑",
  "플러그인",
  "데브모드",
  "피그잼",
  "피그마 슬라이드",
  "피그마메이크",
];
