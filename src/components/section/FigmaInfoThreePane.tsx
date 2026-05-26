"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowUpRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { NotionBlockRenderer } from "@/components/entry/NotionBlockRenderer";
import { filterItems } from "@/hooks/useSectionFilter";
import { useSearchContext } from "@/components/search/SearchProvider";
import type { SubTab } from "@/lib/navigation";
import type { SearchIndexItem, NotionBlock } from "@/types";

interface FigmaInfoThreePaneProps {
  title: string;
  description?: string;
  subTabs: SubTab[];
  initialMainItems: SearchIndexItem[];
  initialMultiSectionData: Record<string, SearchIndexItem[]>;
}

const RELATED_PROMPTS = [
  "한 줄로 요약해줘",
  "초보자에게 설명해줘",
  "비슷한 케이스가 있나요?",
  "실수하기 쉬운 점은?",
];

export function FigmaInfoThreePane({
  title,
  description,
  subTabs,
  initialMainItems,
  initialMultiSectionData,
}: FigmaInfoThreePaneProps) {
  const [activeTabKey, setActiveTabKey] = useState(subTabs[0]?.key ?? "");
  const [filterText, setFilterText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { setQuery, openSearch } = useSearchContext();

  // Notion 본문 캐시: id → blocks
  const blocksCacheRef = useRef<Map<string, NotionBlock[]>>(new Map());
  const [blocks, setBlocks] = useState<NotionBlock[] | null>(null);
  const [isLoadingBody, setIsLoadingBody] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);

  const activeTab = subTabs.find((t) => t.key === activeTabKey) ?? subTabs[0];

  const baseItems = useMemo<SearchIndexItem[]>(() => {
    if (!activeTab) return [];
    if (activeTab.sectionDataKey) {
      return initialMultiSectionData[activeTab.sectionDataKey] ?? [];
    }
    if (activeTab.filter) {
      return filterItems(initialMainItems, activeTab.filter);
    }
    return initialMainItems;
  }, [activeTab, initialMainItems, initialMultiSectionData]);

  const filtered = useMemo(() => {
    if (!filterText.trim()) return baseItems;
    const q = filterText.toLowerCase();
    return baseItems.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.categories.some((c) => c.toLowerCase().includes(q)),
    );
  }, [baseItems, filterText]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of subTabs) {
      if (t.sectionDataKey) {
        counts[t.key] = initialMultiSectionData[t.sectionDataKey]?.length ?? 0;
      } else if (t.filter) {
        counts[t.key] = filterItems(initialMainItems, t.filter).length;
      } else {
        counts[t.key] = initialMainItems.length;
      }
    }
    return counts;
  }, [subTabs, initialMainItems, initialMultiSectionData]);

  const selected = filtered.find((it) => it.id === selectedId) ?? filtered[0];
  const hasExternalLink = !!selected?.link;

  // selected 변경 시 본문 fetch (외부 링크면 skip)
  useEffect(() => {
    if (!selected || hasExternalLink) {
      setBlocks(null);
      setBodyError(null);
      return;
    }
    const id = selected.id;
    const cached = blocksCacheRef.current.get(id);
    if (cached) {
      setBlocks(cached);
      setBodyError(null);
      setIsLoadingBody(false);
      return;
    }

    let cancelled = false;
    setIsLoadingBody(true);
    setBodyError(null);
    setBlocks(null);

    fetch(`/api/entry/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { blocks?: NotionBlock[] };
        if (cancelled) return;
        const next = data.blocks ?? [];
        blocksCacheRef.current.set(id, next);
        setBlocks(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setBodyError(err instanceof Error ? err.message : "본문 로드 실패");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBody(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected?.id, hasExternalLink]);

  function askThisDoc(prompt: string) {
    if (!selected) return;
    setQuery(`"${selected.title}" — ${prompt}`);
    openSearch();
  }

  const dateLabel = selected?.publishedDate
    ? new Date(selected.publishedDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="grid xl-nav:grid-cols-[320px_1fr_280px] grid-cols-1
                 xl-nav:h-[calc(100vh-0px)] min-h-screen"
    >
      {/* ── Pane 1: List ──────────────────────────────────────────── */}
      <aside className="flex flex-col overflow-hidden border-r border-border-1 min-w-0">
        <div className="px-5 pt-6 pb-3 border-b border-border-1">
          <div className="eyebrow mb-1">{title}</div>
          <h2 className="text-[22px] font-semibold tracking-tight leading-tight">
            실무에서 막히는 모든 것
          </h2>
          {description && (
            <p className="mt-2 text-meta text-fg-3 leading-relaxed">
              {description}
            </p>
          )}

          <div className="relative mt-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-4"
            />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="필터…"
              className="w-full h-10 pl-9 pr-3 rounded-lg
                         bg-glass-1 border border-border-1
                         text-body text-fg-1 placeholder:text-fg-4
                         focus:border-border-2 focus:bg-glass-2 outline-none
                         transition-colors"
            />
          </div>

          <div className="flex gap-1 mt-3 overflow-x-auto custom-scrollbar pb-1">
            {subTabs.map((t) => {
              const active = t.key === activeTabKey;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setActiveTabKey(t.key);
                    setSelectedId(null);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-md text-meta font-medium
                              border transition-colors whitespace-nowrap
                              ${
                                active
                                  ? "bg-glass-3 border-border-2 text-fg-1"
                                  : "bg-transparent border-transparent text-fg-3 hover:text-fg-1 hover:bg-glass-1"
                              }`}
                >
                  {t.label}
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {tabCounts[t.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-body text-fg-4 text-center">
              일치하는 항목 없음
            </div>
          ) : (
            filtered.map((it) => {
              const active = selected?.id === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelectedId(it.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg mb-1
                              transition-colors
                              ${active ? "bg-glass-3" : "hover:bg-glass-1"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {it.categories[0] && <Badge category={it.categories[0]} />}
                    {it.shortcut && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-glass-2 border border-border-1 text-fg-3">
                        {it.shortcut}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-fg-1 line-clamp-2">
                    {it.title}
                  </div>
                  {it.author && (
                    <div className="text-[11px] text-fg-4 mt-1.5">
                      {it.author}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Pane 2: Detail preview ────────────────────────────────── */}
      <section className="overflow-y-auto custom-scrollbar min-w-0">
        {selected ? (
          <article className="max-w-2xl mx-auto px-8 xl-nav:px-10 py-8 xl-nav:py-12">
            <div className="mb-5 flex items-center gap-2 flex-wrap">
              {selected.categories.map((c) => (
                <Badge key={c} category={c} />
              ))}
            </div>
            <h1 className="text-h2 xl-nav:text-h1 font-semibold tracking-tight leading-tight text-balance text-fg-1">
              {selected.title}
            </h1>
            <div className="mt-4 flex items-center gap-2.5 text-meta text-fg-4 flex-wrap">
              {selected.author && <span>{selected.author}</span>}
              {dateLabel && (
                <>
                  <span>·</span>
                  <span>{dateLabel}</span>
                </>
              )}
              {selected.shortcut && (
                <>
                  <span>·</span>
                  <span className="font-mono">{selected.shortcut}</span>
                </>
              )}
            </div>

            {selected.thumbnail && (
              <div className="mt-6 rounded-xl overflow-hidden bg-glass-2 border border-border-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.thumbnail}
                  alt=""
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                             bg-glass-3 border border-border-2
                             text-body font-medium text-fg-1
                             hover:bg-glass-4 hover:border-border-3 transition-colors"
                >
                  외부 링크 열기
                  <ArrowUpRight size={14} />
                </a>
              )}
              <span className="text-meta text-fg-4">
                {filtered.indexOf(selected) + 1} / {filtered.length}
              </span>
            </div>

            {/* ── Notion 본문 (외부 링크가 아닌 항목만) ─────────── */}
            {!hasExternalLink && (
              <div className="mt-10 pt-8 border-t border-border-1">
                {isLoadingBody && (
                  <div className="space-y-3">
                    <div className="h-4 bg-glass-2 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-glass-2 rounded animate-pulse w-full" />
                    <div className="h-4 bg-glass-2 rounded animate-pulse w-5/6" />
                    <div className="h-4 bg-glass-2 rounded animate-pulse w-2/3" />
                  </div>
                )}
                {bodyError && !isLoadingBody && (
                  <p className="text-body text-fg-4">
                    본문을 불러올 수 없습니다.{" "}
                    <Link
                      href={`/entry/${selected.id}`}
                      className="text-fg-2 underline"
                    >
                      단독 페이지에서 보기
                    </Link>
                  </p>
                )}
                {blocks &&
                  !isLoadingBody &&
                  !bodyError &&
                  (blocks.length > 0 ? (
                    <NotionBlockRenderer blocks={blocks} />
                  ) : (
                    <p className="text-body text-fg-4">본문이 비어있습니다.</p>
                  ))}
              </div>
            )}
          </article>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[60vh] text-center px-8">
            <div className="max-w-sm">
              <div className="eyebrow mb-3">피그마 정보</div>
              <h2 className="text-h2 font-semibold tracking-tight leading-tight text-fg-1 mb-3">
                왼쪽에서 항목을 선택하세요
              </h2>
              <p className="text-body text-fg-3 leading-relaxed">
                실무 Q&amp;A · 용어 · 단축키 · 플러그인 — 카테고리별로 정리되어
                있습니다.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Pane 3: AI sidekick ──────────────────────────────────── */}
      <aside
        className="hidden xl-nav:flex flex-col gap-5 overflow-y-auto custom-scrollbar
                   border-l border-border-1 px-4 py-5 min-w-0
                   bg-[rgba(83,109,254,0.02)]"
      >
        <div>
          <div
            className="flex items-center gap-1.5 text-meta font-semibold mb-2.5
                       text-[var(--fp-brand-blue-accent)] uppercase tracking-wider"
          >
            <Sparkles size={13} />이 문서로 묻기
          </div>
          <div className="flex flex-col gap-1.5">
            {RELATED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => askThisDoc(p)}
                disabled={!selected}
                className="text-left px-3 py-2 rounded-md
                           bg-glass-1 border border-border-1
                           text-meta text-fg-2
                           hover:bg-glass-2 hover:border-border-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-2.5">관련 문서</div>
          <div className="flex flex-col gap-1.5">
            {filtered
              .filter((it) => it.id !== selected?.id)
              .slice(0, 5)
              .map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelectedId(it.id)}
                  className="text-left px-2.5 py-2 rounded-md
                             border border-border-1
                             text-meta text-fg-2 leading-snug
                             hover:bg-glass-1 hover:border-border-2
                             transition-colors line-clamp-2"
                >
                  {it.title}
                </button>
              ))}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-2.5">전체 항목</div>
          <div className="flex items-center gap-1.5 text-meta text-fg-3">
            <Eye size={13} />
            현재 탭에 {filtered.length}개
          </div>
        </div>
      </aside>
    </div>
  );
}
