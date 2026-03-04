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

  const csvPath = join(
    process.cwd(),
    "[Figma 레시피북]용어 정리 - Figma Glossary_20241218 2.csv"
  );
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
 * 용어집 항목 수 (디버깅용).
 */
export function getGlossaryCount(): number {
  return parseGlossaryCSV().length;
}
