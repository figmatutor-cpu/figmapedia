"use client";

import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import type { ExperimentMeta } from "@/types/experiment";
import { ArchiveCard } from "./ArchiveCard";

interface Props {
  experiments: ExperimentMeta[];
}

type SortKey = "latest" | "oldest" | "title";

const PAGE_SIZE = 10;

export function ArchiveBrowser({ experiments }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const tools = useMemo(
    () => Array.from(new Set(experiments.map((e) => e.tool))).sort(),
    [experiments],
  );
  const tags = useMemo(
    () => Array.from(new Set(experiments.flatMap((e) => e.tags))).sort(),
    [experiments],
  );

  const fuse = useMemo(
    () =>
      new Fuse(experiments, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "summary", weight: 0.3 },
          { name: "tool", weight: 0.1 },
          { name: "tags", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [experiments],
  );

  const filtered = useMemo(() => {
    let rows = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : experiments;
    if (selectedTool) rows = rows.filter((e) => e.tool === selectedTool);
    if (selectedTag) rows = rows.filter((e) => e.tags.includes(selectedTag));

    const sorted = [...rows];
    if (sort === "latest") {
      sorted.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => (a.publishedAt > b.publishedAt ? 1 : -1));
    } else if (sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ko-KR"));
    }
    return sorted;
  }, [experiments, fuse, query, selectedTool, selectedTag, sort]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  function resetFilters() {
    setQuery("");
    setSelectedTool("");
    setSelectedTag("");
    setSort("latest");
    setLimit(PAGE_SIZE);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-1 bg-glass-2 p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="제목, 요약, 도구, 태그 검색..."
            className="rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
          />

          <select
            value={selectedTool}
            onChange={(e) => {
              setSelectedTool(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-meta text-fg-1 focus:border-border-3 focus:outline-none"
          >
            <option value="">모든 도구</option>
            {tools.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-meta text-fg-1 focus:border-border-3 focus:outline-none"
          >
            <option value="">모든 태그</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-meta text-fg-1 focus:border-border-3 focus:outline-none"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
        </div>

        {(query || selectedTool || selectedTag || sort !== "latest") && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xxs text-fg-4">
            <span>{filtered.length}건 검색됨</span>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-border-1 bg-glass-1 px-3 py-1 text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
            >
              초기화
            </button>
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-10 text-center">
          <p className="text-body text-fg-3">검색 결과가 없습니다.</p>
          <p className="mt-1 text-meta text-fg-4">
            다른 키워드로 시도하거나 필터를 초기화해보세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((exp) => (
            <li key={exp.slug}>
              <ArchiveCard experiment={exp} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-meta font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
          >
            더 보기 ({filtered.length - limit}건 남음)
          </button>
        </div>
      )}
    </div>
  );
}
