import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { APIResponseError } from "@notionhq/client";
import { fetchEntryById, fetchPageBlocks } from "@/lib/notion";
import { mapNotionPageToEntry, mapNotionBlock } from "@/lib/notion-mapper";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";
import { NotionBlockRenderer } from "@/components/entry/NotionBlockRenderer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figmapedia.com";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const page = await fetchEntryById(id);
    if (!page) return {};

    const entry = mapNotionPageToEntry(page);
    const title = `${entry.title} | Figmapedia`;
    const description = `${entry.categories.join(", ")} — Figmapedia 디자인 용어사전`;
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
    page = await fetchEntryById(id);
  } catch (error) {
    // Rate limited: 1초 대기 후 1회 재시도
    if (error instanceof APIResponseError && error.code === "rate_limited") {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        page = await fetchEntryById(id);
      } catch {
        throw new Error("일시적으로 요청이 많습니다. 잠시 후 다시 시도해 주세요.");
      }
    } else {
      notFound();
    }
  }

  if (!page) {
    notFound();
  }

  const entry = mapNotionPageToEntry(page);
  const rawBlocks = await fetchPageBlocks(page.id);
  const blocks = rawBlocks.map(mapNotionBlock);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-[120px] pb-12 min-h-screen bg-bg-base">
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
        <NotionBlockRenderer blocks={blocks} />
      </div>
    </article>
  );
}
