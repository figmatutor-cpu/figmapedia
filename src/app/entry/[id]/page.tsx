import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchEntryById, fetchPageBlocks } from "@/lib/notion";
import { mapNotionPageToEntry, mapNotionBlock } from "@/lib/notion-mapper";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";
import { NotionBlockRenderer } from "@/components/entry/NotionBlockRenderer";

export const revalidate = 120;

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let page;
  try {
    page = await fetchEntryById(id);
  } catch {
    notFound();
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
