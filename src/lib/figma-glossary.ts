import { readFileSync } from "fs";
import { join } from "path";

/**
 * Figma 영문↔한글 용어집 CSV를 파싱하여
 * Gemini 프롬프트에 포함할 컨텍스트 문자열을 생성.
 *
 * 검색 시 "오토 레이아웃" → "Auto layout" 매핑 등
 * 한→영, 영→한 양방향 용어 인식을 위해 사용.
 */

interface GlossaryEntry {
  en: string;
  ko: string;
}

let cachedEntries: GlossaryEntry[] | null = null;

function parseGlossaryCSV(): GlossaryEntry[] {
  if (cachedEntries) return cachedEntries;

  const csvPath = join(process.cwd(), "src/data/figma-glossary.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").slice(1); // skip header

  const entries: GlossaryEntry[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // CSV: 영문,한글,최종 확인 여부
    // Handle quoted values (e.g. "편집자, 편집기")
    const match = trimmed.match(/^([^,]+),("?[^"]*"?),/);
    if (!match) continue;

    const en = match[1].trim();
    const ko = match[2].replace(/"/g, "").trim();
    if (en && ko) {
      entries.push({ en, ko });
    }
  }

  cachedEntries = entries;
  return entries;
}

/**
 * Gemini 프롬프트에 삽입할 용어집 컨텍스트 문자열.
 * "Auto layout = 자동 레이아웃" 형태로 한 줄씩 나열.
 */
export function getGlossaryContext(): string {
  const entries = parseGlossaryCSV();
  return entries.map((e) => `${e.en} = ${e.ko}`).join("\n");
}

/**
 * 검색 쿼리를 용어집 기반으로 확장.
 * "자동 레이아웃" → "자동 레이아웃 Auto layout"
 * "Auto layout" → "Auto layout 자동 레이아웃"
 * 부분 매칭 지원: "레이아웃" → "Auto layout 자동 레이아웃" 등
 */
export function expandQueryWithGlossary(query: string): string {
  const entries = parseGlossaryCSV();
  const queryLower = query.toLowerCase();
  const expansions = new Set<string>();

  for (const { en, ko } of entries) {
    const enLower = en.toLowerCase();
    const koLower = ko.toLowerCase();

    // 쿼리가 한글/영문 용어를 포함하거나, 용어가 쿼리를 포함하는 경우
    if (
      queryLower.includes(koLower) ||
      koLower.includes(queryLower) ||
      queryLower.includes(enLower) ||
      enLower.includes(queryLower)
    ) {
      expansions.add(en);
      expansions.add(ko);
    }
  }

  if (expansions.size === 0) return query;

  // 원본 쿼리 + 확장 용어 결합
  const expanded = [query, ...expansions].join(" ");
  return expanded;
}

/**
 * 임베딩 텍스트에 포함할 용어집 확장어 반환.
 * 제목/카테고리에 매칭되는 한↔영 용어 쌍을 반환.
 */
export function getGlossaryExpansions(text: string): string[] {
  const entries = parseGlossaryCSV();
  const textLower = text.toLowerCase();
  const expansions = new Set<string>();

  for (const { en, ko } of entries) {
    if (
      textLower.includes(en.toLowerCase()) ||
      textLower.includes(ko.toLowerCase())
    ) {
      expansions.add(`${en}(${ko})`);
    }
  }

  return [...expansions];
}

/**
 * 용어집 항목 수 (디버깅용).
 */
export function getGlossaryCount(): number {
  return parseGlossaryCSV().length;
}
