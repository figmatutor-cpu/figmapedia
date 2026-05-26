"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Sparkles, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { NotionBlockRenderer } from "@/components/entry/NotionBlockRenderer";
import type { SubTab } from "@/lib/navigation";
import type { SearchIndexItem, NotionBlock } from "@/types";

interface PromptPlaygroundLayoutProps {
  title: string;
  description?: string;
  subTabs: SubTab[];
  initialSectionItems: SearchIndexItem[];
}

export function PromptPlaygroundLayout({
  title,
  subTabs,
  initialSectionItems,
}: PromptPlaygroundLayoutProps) {
  const [activeTabKey, setActiveTabKey] = useState(subTabs[0]?.key ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeTab = subTabs.find((t) => t.key === activeTabKey) ?? subTabs[0];

  const filtered = useMemo<SearchIndexItem[]>(() => {
    if (activeTab?.categoryFilter) {
      return initialSectionItems.filter((it) =>
        it.categories.some((c) => activeTab.categoryFilter!.includes(c)),
      );
    }
    return initialSectionItems;
  }, [activeTab, initialSectionItems]);

  const selected = filtered.find((it) => it.id === selectedId) ?? filtered[0];
  const isParam = (selected?.categories ?? []).includes("파라미터형");
  const hasExternalLink = !!selected?.link;

  // Notion 본문 캐시
  const blocksCacheRef = useRef<Map<string, NotionBlock[]>>(new Map());
  const [blocks, setBlocks] = useState<NotionBlock[] | null>(null);
  const [isLoadingBody, setIsLoadingBody] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);

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

  return (
    <div className="grid xl-nav:grid-cols-[320px_1fr] h-[calc(100vh-0px)] min-h-screen">
      {/* ── Left: prompt list ────────────────────────────────────── */}
      <aside className="flex flex-col overflow-hidden border-r border-border-1 min-w-0">
        <div className="px-5 pt-6 pb-3 border-b border-border-1">
          <div className="eyebrow mb-1">{title}</div>
          <h2 className="text-[22px] font-semibold tracking-tight leading-tight">
            플레이그라운드
          </h2>

          <div className="flex flex-wrap gap-1 mt-3">
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
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors
                              ${
                                active
                                  ? "bg-glass-3 border-border-2 text-fg-1"
                                  : "bg-transparent border-border-1 text-fg-3 hover:text-fg-1"
                              }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-body text-fg-4 text-center">항목 없음</div>
          ) : (
            filtered.map((it) => {
              const active = selected?.id === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelectedId(it.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-1
                              transition-colors
                              ${active ? "bg-glass-3" : "hover:bg-glass-1"}`}
                >
                  {it.categories[0] && <Badge category={it.categories[0]} />}
                  <div className="text-[13px] font-medium leading-snug text-fg-1 mt-1.5 line-clamp-2">
                    {it.title}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Right: detail ─────────────────────────────────────────── */}
      <main className="overflow-y-auto custom-scrollbar min-w-0">
        {selected ? (
          <div className="max-w-4xl mx-auto px-8 xl-nav:px-10 py-8 xl-nav:py-12">
            <div className="mb-5 flex items-center gap-2 flex-wrap">
              {selected.categories.map((c) => (
                <Badge key={c} category={c} />
              ))}
            </div>
            <h1 className="text-h2 xl-nav:text-h1 font-semibold tracking-tight leading-tight text-balance text-fg-1">
              {selected.title}
            </h1>
            {selected.author && (
              <div className="mt-3 text-meta text-fg-4">{selected.author}</div>
            )}

            {/* Param shell — visual only */}
            {isParam && (
              <div className="mt-6 rounded-xl bg-glass-2 border border-border-1 p-4">
                <div className="eyebrow mb-3">파라미터</div>
                <div className="grid grid-cols-2 xl-nav:grid-cols-3 gap-2.5">
                  {["{브랜드명}", "{톤}", "{primary}"].map((p) => (
                    <label key={p} className="block">
                      <div className="font-mono text-[11px] text-fg-4 mb-1">
                        {p}
                      </div>
                      <input
                        type="text"
                        placeholder="값 입력…"
                        className="w-full h-9 px-2.5 rounded-md
                                   bg-glass-3 border border-border-1
                                   text-body text-fg-1 placeholder:text-fg-4
                                   focus:border-border-2 outline-none"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-fg-4">
                  실제 변수 인터폴레이션은{" "}
                  <strong className="text-fg-3">전체 보기</strong>에서 사용
                  가능합니다.
                </p>
              </div>
            )}

            {/* 2-col preview */}
            <div className="mt-6 grid grid-cols-1 xl-nav:grid-cols-2 gap-3.5">
              <div>
                <div className="eyebrow mb-2">PROMPT</div>
                <div
                  className="rounded-xl border border-border-1 bg-glass-1
                             p-4 min-h-[240px] max-h-[480px] overflow-y-auto custom-scrollbar"
                >
                  {hasExternalLink ? (
                    <p className="font-mono text-meta text-fg-4">
                      외부 링크 항목입니다. 우측 상단 "외부 링크 열기"를
                      이용하세요.
                    </p>
                  ) : isLoadingBody ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-glass-3 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-glass-3 rounded animate-pulse w-full" />
                      <div className="h-3 bg-glass-3 rounded animate-pulse w-5/6" />
                      <div className="h-3 bg-glass-3 rounded animate-pulse w-2/3" />
                    </div>
                  ) : bodyError ? (
                    <p className="font-mono text-meta text-fg-4">
                      본문을 불러올 수 없습니다.{" "}
                      <Link
                        href={`/entry/${selected.id}`}
                        className="text-fg-2 underline"
                      >
                        단독 페이지로 이동
                      </Link>
                    </p>
                  ) : blocks && blocks.length > 0 ? (
                    <div className="prose-sm">
                      <NotionBlockRenderer blocks={blocks} />
                    </div>
                  ) : (
                    <p className="font-mono text-meta text-fg-4">
                      본문이 비어있습니다.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-2">예상 결과 미리보기</div>
                <div className="rounded-xl border border-border-1 bg-glass-2 p-4 min-h-[240px]">
                  <div className="font-mono text-[11px] text-fg-4 mb-3">
                    GENERATED · PREVIEW
                  </div>
                  <div
                    className="aspect-[9/12] rounded-lg p-3.5 flex flex-col"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(83,109,254,0.2) 0%, var(--fp-glass-3) 50%)",
                    }}
                  >
                    <div className="h-1.5 w-8 bg-surface-inverse/40 rounded-full mb-3" />
                    <div className="text-h3 font-bold text-fg-1 tracking-tight">
                      {selected.title.slice(0, 24)}
                    </div>
                    <div className="text-[11px] text-fg-3 mt-1 flex-1">
                      미리보기 placeholder
                    </div>
                    <div className="h-9 rounded-md bg-[var(--fp-brand-blue-accent)] text-fg-1 text-meta font-semibold flex items-center justify-center">
                      시작하기
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              {selected.link ? (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 inline-flex items-center gap-2 rounded-lg
                             bg-[var(--fp-brand-blue-accent)] text-fg-1 text-body font-semibold
                             hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={14} />
                  Make에서 열기
                  <ArrowUpRight size={13} />
                </a>
              ) : null}
              <Link
                href={`/entry/${selected.id}`}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-lg
                           bg-glass-3 border border-border-1 text-fg-1 text-body font-medium
                           hover:bg-glass-4 hover:border-border-2 transition-colors"
              >
                전체 보기
                <ChevronRight size={14} />
              </Link>
              <button
                type="button"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-lg
                           bg-glass-3 border border-border-1 text-fg-1 text-body font-medium
                           hover:bg-glass-4 hover:border-border-2 transition-colors"
              >
                <Bookmark size={14} />
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[60vh] text-center px-8">
            <div className="max-w-sm">
              <div className="eyebrow mb-3">프롬프트 페디아</div>
              <h2 className="text-h2 font-semibold tracking-tight text-fg-1 mb-3">
                왼쪽에서 프롬프트를 선택하세요
              </h2>
              <p className="text-body text-fg-3 leading-relaxed">
                한글자연어 · 영문자연어 · JSON · 파라미터형 · 코드 — 카테고리별
                탭에서 골라보세요.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
