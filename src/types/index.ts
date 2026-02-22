export interface Entry {
  id: string;
  title: string;
  categories: string[];
  author: string;
  link: string | null;
  publishedDate: string | null;
  lastEditedTime: string;
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
}

export interface NotionBlock {
  id: string;
  type: string;
  content: string;
  /** URL for media blocks (image, video, file, pdf, embed, bookmark) */
  mediaUrl?: string;
  /** Caption text for media blocks */
  caption?: string;
  children?: NotionBlock[];
}

export interface EntryDetail extends Entry {
  blocks: NotionBlock[];
}
