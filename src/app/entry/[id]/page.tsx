import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { APIResponseError } from "@notionhq/client";
import { fetchEntryById, fetchPageBlocks } from "@/lib/notion";
import { mapNotionPageToEntry, mapNotionBlock } from "@/lib/notion-mapper";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";
import { NotionBlockRenderer } from "@/components/entry/NotionBlockRenderer";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://figmapedia.com").trim();

export const revalidate = 3600;

/* ── React cache()로 같은 요청 내 중복 fetch 제거 ── */
const getEntry = cache(async (id: string) => fetchEntryById(id));
const getBlocks = cache(async (id: string) => fetchPageBlocks(id));

/** Notion 블록 배열에서 텍스트만 추출 (SEO description용) */
function extractTextFromBlocks(blocks: any[], maxLength: number = 155): string {
  const texts: string[] = [];
  let totalLen = 0;

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];
    if (!data?.rich_text) continue;

    const text = (data.rich_text as any[])
      .map((rt: any) => rt.plain_text ?? "")
      .join("")
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F\u20E3]/gu, "").replace(/[0-9]\uFE0F\u20E3/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) continue;
    texts.push(text);
    totalLen += text.length;
    if (totalLen >= maxLength) break;
  }

  const joined = texts.join(" ");
  if (joined.length <= maxLength) return joined;
  return joined.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const page = await getEntry(id);
    if (!page || (page as any).archived || (page as any).in_trash) return {};

    const entry = mapNotionPageToEntry(page);
    const rawBlocks = await getBlocks(page.id);
    const excerpt = extractTextFromBlocks(rawBlocks);

    const hasFigmaKeyword = /피그마|figma/i.test(entry.title);
    const seoTitle = hasFigmaKeyword ? entry.title : `피그마 ${entry.title}`;
    const title = `${seoTitle} | Figmapedia`;
    const description = excerpt
      ? `${entry.title} — ${excerpt}`
      : `${entry.title} — ${entry.categories.join(", ")} | Figmapedia 디자인 용어사전`;
    const url = `${SITE_URL}/entry/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        ...(entry.publishedDate && { publishedTime: entry.publishedDate }),
        ...(entry.thumbnail && {
          images: [{ url: entry.thumbnail, width: 1200, height: 630 }],
        }),
      },
      twitter: {
        card: entry.thumbnail ? "summary_large_image" : "summary",
        title,
        description,
        ...(entry.thumbnail && { images: [entry.thumbnail] }),
      },
    };
  } catch {
    return {};
  }
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let page;
  try {
    page = await getEntry(id);
  } catch (error) {
    // Rate limited: 1초 대기 후 1회 재시도
    if (error instanceof APIResponseError && error.code === "rate_limited") {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        page = await getEntry(id);
      } catch {
        throw new Error("일시적으로 요청이 많습니다. 잠시 후 다시 시도해 주세요.");
      }
    } else {
      redirect("/figma-info");
    }
  }

  if (!page || (page as any).archived || (page as any).in_trash) {
    redirect("/figma-info");
  }

  const entry = mapNotionPageToEntry(page);

  let rawBlocks;
  try {
    rawBlocks = await getBlocks(page.id);
  } catch {
    redirect("/figma-info");
  }
  const blocks = rawBlocks.map(mapNotionBlock);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-16 min-h-screen bg-bg-base">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        목록으로 돌아가기
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {entry.categories.map((cat) => (
            <Badge key={cat} category={cat} />
          ))}
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          {entry.title}
        </h1>
        <EntryMeta author={entry.author} publishedDate={entry.publishedDate} className="mt-2" />
      </header>

      <div className="border-t border-white/10 pt-8">
        {blocks.length === 0 && entry.link ? (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.08] transition-all"
          >
            <svg
              className="w-5 h-5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-sm text-gray-300 truncate">{entry.link}</span>
          </a>
        ) : (
          <NotionBlockRenderer blocks={blocks} />
        )}
      </div>
    </article>
  );
}
