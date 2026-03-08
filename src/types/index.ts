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
  /** Notion 페이지 마지막 수정 시각 (임베딩 동기화용) */
  lastEditedTime?: string;
  /** 용어집 기반 한↔영 키워드 (Fuse.js 검색용) */
  glossaryKeywords?: string;
}

export interface EmbeddingMatch {
  id: string;
  section: string;
  title: string;
  categories: string[];
  fullText: string;
  similarity: number;
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

export interface RichTextItem {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  content: string;
  /** Notion rich text array — preserves inline hyperlinks and annotations */
  richText?: RichTextItem[];
  /** URL for media blocks (image, video, file, pdf, embed, bookmark) */
  mediaUrl?: string;
  /** Caption text for media blocks */
  caption?: string;
  /** 코드 블록 언어 (e.g. "javascript", "python") */
  language?: string;
  /** to_do 블록 체크 상태 */
  checked?: boolean;
  /** callout 블록 아이콘 (이모지 또는 외부 이미지 URL) */
  icon?: string;
  children?: NotionBlock[];
}

export interface EntryDetail extends Entry {
  blocks: NotionBlock[];
}

/* ── Community ── */

export interface CommunityPost {
  id: string;
  nickname: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  comment_count?: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  nickname: string;
  content: string;
  created_at: string;
}
