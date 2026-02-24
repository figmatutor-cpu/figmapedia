export interface Entry {
  id: string;
  title: string;
  categories: string[];
  author: string;
  link: string | null;
  publishedDate: string | null;
  lastEditedTime: string;
  thumbnail?: string;
}

export interface SearchIndexItem {
  id: string;
  title: string;
  categories: string[];
  author: string;
  link: string | null;
  publishedDate: string | null;
  /** 단축키 텍스트 (Mac/Win shortcuts only) */
  shortcut?: string;
  /** Notion 페이지 커버 이미지 URL */
  thumbnail?: string;
  /** 소속 섹션 라벨 (AI 검색용) */
  section?: string;
}

export interface SearchIndex {
  items: SearchIndexItem[];
  generatedAt: string;
  totalCount: number;
}

export interface AISearchResponse {
  results: SearchIndexItem[];
  query: string;
  isAIResult: boolean;
  /** AI가 생성한 검색 결과 요약 (최대 3줄) */
  summary?: string;
}

export interface NotionBlock {
  id: string;
  type: string;
  content: string;
  /** URL for media blocks (image, video, file, pdf, embed, bookmark) */
  mediaUrl?: string;
  /** Caption text for media blocks */
  caption?: string;
  /** 코드 블록 언어 (e.g. "javascript", "python") */
  language?: string;
  children?: NotionBlock[];
}

export interface EntryDetail extends Entry {
  blocks: NotionBlock[];
}
