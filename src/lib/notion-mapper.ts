import type { Entry, SearchIndexItem, NotionBlock } from "@/types";

function extractPlainText(richTextArray: any[]): string {
  return richTextArray?.map((t: any) => t.plain_text).join("") ?? "";
}

export function mapNotionPageToEntry(page: any): Entry {
  const props = page.properties;

  return {
    id: page.id,
    title: extractPlainText(props["글 제목 "]?.title),
    categories:
      props["질문 카테고리"]?.multi_select?.map((t: any) => t.name) ?? [],
    author: extractPlainText(props["해결자 닉네임"]?.rich_text),
    link: props["링크"]?.url ?? null,
    publishedDate: props["글 작성일"]?.date?.start ?? null,
    lastEditedTime: page.last_edited_time,
  };
}

export function entryToSearchIndexItem(entry: Entry): SearchIndexItem {
  const { lastEditedTime, ...indexItem } = entry;
  return indexItem;
}

/* ── Mappers for separate Notion databases ── */

/** 프롬프트 피디아 DB — properties: 이름(title), 프롬프트, 툴, 프롬프트 타입, 캐릭터 유무 */
export function mapPromptPage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["이름"]?.title),
    categories: props["프롬프트 타입"]?.multi_select?.map((t: any) => t.name) ?? [],
    author: "",
    link: null,
    publishedDate: null,
  };
}

/** 키오스크 리스트 DB — properties: 키오스크명(title), 키워드, 날짜, 담당자 */
export function mapKioskPage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["키오스크명"]?.title),
    categories: props["키워드"]?.multi_select?.map((t: any) => t.name) ?? [],
    author: extractPlainText(props["담당자"]?.rich_text),
    link: null,
    publishedDate: props["날짜"]?.date?.start ?? null,
  };
}

/** UX/UI 아티클 & 기술&디자인 블로그 DB — properties: 제목(title), 링크, 지식 공유자, 날짜 */
export function mapArticlePage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["제목"]?.title),
    categories: [],
    author: extractPlainText(props["지식 공유자"]?.rich_text),
    link: props["링크"]?.url ?? null,
    publishedDate: props["날짜"]?.date?.start ?? null,
  };
}

/** UXUI 용어집 DB — properties: 키오스크명(title), 날짜, 기타 */
export function mapUxuiTermPage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["키오스크명"]?.title),
    categories: [],
    author: "",
    link: null,
    publishedDate: props["날짜"]?.date?.start ?? null,
  };
}

/** 유용한 피그마 플러그인 DB — properties: ﻿테마별 플러그인(title, BOM prefix), 진행일자, 작성자 */
export function mapPluginPage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["\uFEFF테마별 플러그인"]?.title),
    categories: ["플러그인"],
    author: extractPlainText(props["작성자"]?.rich_text),
    link: null,
    publishedDate: props["진행일자"]?.date?.start ?? null,
  };
}

/** Mac/Win 단축키 DB — properties: 항목(title), 단축키, 카테고리, 설명(Mac only) */
export function mapShortcutPage(page: any): SearchIndexItem {
  const props = page.properties;
  return {
    id: page.id,
    title: extractPlainText(props["항목"]?.title),
    categories: props["카테고리"]?.multi_select?.map((t: any) => t.name) ?? [],
    author: "",
    link: null,
    publishedDate: null,
    shortcut: extractPlainText(props["단축키"]?.rich_text) || undefined,
  };
}

function extractBlockText(block: any): string {
  const type = block.type;
  const data = block[type];
  if (!data?.rich_text) return "";
  return extractPlainText(data.rich_text);
}

/**
 * Extract the media URL from a Notion file object.
 * Notion stores files as either `file` (uploaded, with expiring S3 URL)
 * or `external` (user-provided URL).
 */
function extractFileUrl(fileObj: any): string | undefined {
  if (!fileObj) return undefined;
  if (fileObj.type === "file") return fileObj.file?.url;
  if (fileObj.type === "external") return fileObj.external?.url;
  // Fallback: try direct properties
  return fileObj.file?.url ?? fileObj.external?.url ?? undefined;
}

function extractCaption(data: any): string | undefined {
  if (!data?.caption || data.caption.length === 0) return undefined;
  return extractPlainText(data.caption);
}

export function mapNotionBlock(block: any): NotionBlock {
  const type = block.type;
  const data = block[type];

  // Media blocks: image, video, file, pdf
  if (type === "image" || type === "video" || type === "file" || type === "pdf") {
    return {
      id: block.id,
      type,
      content: "",
      mediaUrl: extractFileUrl(data),
      caption: extractCaption(data),
    };
  }

  // Embed block (iframe URLs like YouTube, Figma, etc.)
  if (type === "embed") {
    return {
      id: block.id,
      type,
      content: "",
      mediaUrl: data?.url,
      caption: extractCaption(data),
    };
  }

  // Bookmark block
  if (type === "bookmark") {
    return {
      id: block.id,
      type,
      content: "",
      mediaUrl: data?.url,
      caption: extractCaption(data),
    };
  }

  return {
    id: block.id,
    type,
    content: extractBlockText(block),
  };
}
