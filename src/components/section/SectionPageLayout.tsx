"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { filterItems } from "@/hooks/useSectionFilter";
import { EntryCard } from "@/components/cards/EntryCard";
import { VerticalCard } from "@/components/cards/VerticalCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/ui/SearchIcon";
import type { SubTab, FilterConfig } from "@/lib/navigation";
import type { SearchIndexItem } from "@/types";

interface SectionPageLayoutProps {
  title: string;
  description?: string;
  subTabs?: SubTab[];
  defaultFilter?: FilterConfig;
  sectionDataKey?: string;
  /** 페이지 레벨 썸네일 표시 여부 (탭의 showThumbnail이 우선) */
  showThumbnail?: boolean;
  /** 카드 레이아웃: grid(세로형) 또는 list(가로형). 기본값 list */
  cardLayout?: "list" | "grid";
  /** 서버에서 미리 fetch한 단일 섹션 데이터 (prompt, kiosk 등) */
  initialSectionItems?: SearchIndexItem[];
  /** 서버에서 미리 fetch한 멀티 섹션 데이터 (shortcuts, uxui-* 등) */
  initialMultiSectionData?: Record<string, SearchIndexItem[]>;
  /** 서버에서 미리 fetch한 메인 검색 인덱스 데이터 (figma-info 용) */
  initialMainItems?: SearchIndexItem[];
}

function useSectionItems(
  sectionKey: string | undefined,
  initialItems?: SearchIndexItem[]
) {
  const [items, setItems] = useState<SearchIndexItem[]>(initialItems ?? []);
  const [isLoading, setIsLoading] = useState(!!sectionKey && !initialItems);

  useEffect(() => {
    if (!sectionKey || initialItems) return;
    setIsLoading(true);
    fetch(`/api/section-data?section=${sectionKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) setItems(data.items);
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  }, [sectionKey, initialItems]);

  return { items, isLoading };
}

function useMultiSectionItems(
  sectionKeys: string[],
  initialData?: Record<string, SearchIndexItem[]>
) {
  const [data, setData] = useState<Record<string, SearchIndexItem[]>>(
    initialData ?? {}
  );
  const [isLoading, setIsLoading] = useState(
    sectionKeys.length > 0 && !initialData
  );
  const keysStr = sectionKeys.join(",");

  useEffect(() => {
    if (sectionKeys.length === 0 || initialData) return;
    setIsLoading(true);
    Promise.all(
      sectionKeys.map((key) =>
        fetch(`/api/section-data?section=${key}`)
          .then((res) => res.json())
          .then((d) => ({
            key,
            items: d.items && Array.isArray(d.items) ? d.items : [],
          }))
          .catch(() => ({ key, items: [] as SearchIndexItem[] }))
      )
    ).then((results) => {
      const combined: Record<string, SearchIndexItem[]> = {};
      for (const r of results) combined[r.key] = r.items;
      setData(combined);
      setIsLoading(false);
    });
  }, [keysStr, initialData]);

  return { data, isLoading };
}

/** Filter items by category names (exact match on any) */
function filterByCategory(
  items: SearchIndexItem[],
  categories: string[]
): SearchIndexItem[] {
  if (categories.length === 0) return items;
  return items.filter((item) =>
    item.categories.some((c) => categories.includes(c))
  );
}

export function SectionPageLayout({
  title,
  description,
  subTabs,
  defaultFilter,
  sectionDataKey,
  showThumbnail = false,
  cardLayout = "list",
  initialSectionItems,
  initialMultiSectionData,
  initialMainItems,
}: SectionPageLayoutProps) {
  const [activeTab, setActiveTab] = useState(subTabs?.[0]?.key ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const subTabSectionKeys = useMemo(
    () =>
      subTabs
        ?.filter((t) => t.sectionDataKey)
        .map((t) => t.sectionDataKey!) ?? [],
    [subTabs]
  );
  const hasSubTabSections = subTabSectionKeys.length > 0;

  const { items: fetchedMainItems, isLoading: fetchedMainLoading } = useSearchIndex();
  const mainItems = initialMainItems ?? fetchedMainItems;
  const mainLoading = initialMainItems ? false : fetchedMainLoading;

  const { items: singleSectionItems, isLoading: singleLoading } =
    useSectionItems(sectionDataKey, initialSectionItems);
  const { data: multiSectionData, isLoading: multiLoading } =
    useMultiSectionItems(hasSubTabSections ? subTabSectionKeys : [], initialMultiSectionData);

  // Items before search filtering
  const baseItems = useMemo(() => {
    // Page-level sectionDataKey (e.g. prompt, kiosk)
    if (sectionDataKey) {
      if (activeTab && subTabs) {
        const tab = subTabs.find((t) => t.key === activeTab);
        // categoryFilter: filter within the same section DB
        if (tab?.categoryFilter) {
          return filterByCategory(singleSectionItems, tab.categoryFilter);
        }
      }
      // "전체" tab or no subTabs → return all section items
      return singleSectionItems;
    }

    // SubTab with its own sectionDataKey (e.g. mac-shortcuts, uxui-articles)
    if (hasSubTabSections && activeTab) {
      const tab = subTabs?.find((t) => t.key === activeTab);
      if (tab?.sectionDataKey) {
        return multiSectionData[tab.sectionDataKey] ?? [];
      }
    }

    // SubTab with filter (e.g. figma-qa category filter on main DB)
    const currentFilter = activeTab
      ? subTabs?.find((t) => t.key === activeTab)?.filter
      : defaultFilter;
    return currentFilter ? filterItems(mainItems, currentFilter) : mainItems;
  }, [
    sectionDataKey,
    singleSectionItems,
    hasSubTabSections,
    activeTab,
    subTabs,
    multiSectionData,
    mainItems,
    defaultFilter,
  ]);

  // Apply in-page search
  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return baseItems;
    const q = searchQuery.toLowerCase();
    return baseItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.categories.some((c) => c.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.shortcut && item.shortcut.toLowerCase().includes(q))
    );
  }, [baseItems, searchQuery]);

  const isLoading = useMemo(() => {
    if (sectionDataKey) return singleLoading;
    if (activeTab) {
      const tab = subTabs?.find((t) => t.key === activeTab);
      if (tab?.sectionDataKey) return multiLoading;
      return mainLoading;
    }
    return hasSubTabSections ? multiLoading : mainLoading;
  }, [
    sectionDataKey,
    singleLoading,
    activeTab,
    subTabs,
    multiLoading,
    mainLoading,
    hasSubTabSections,
  ]);

  // 탭의 showThumbnail이 정의되어 있으면 우선, 아니면 페이지 레벨 설정 사용
  const resolvedShowThumbnail = useMemo(() => {
    if (activeTab && subTabs) {
      const tab = subTabs.find((t) => t.key === activeTab);
      if (tab?.showThumbnail !== undefined) return tab.showThumbnail;
    }
    return showThumbnail;
  }, [activeTab, subTabs, showThumbnail]);

  // 탭의 cardLayout이 정의되어 있으면 우선, 아니면 페이지 레벨 설정 사용
  const resolvedCardLayout = useMemo(() => {
    if (activeTab && subTabs) {
      const tab = subTabs.find((t) => t.key === activeTab);
      if (tab?.cardLayout) return tab.cardLayout;
    }
    return cardLayout;
  }, [activeTab, subTabs, cardLayout]);

  // Tab counts
  const tabCounts = useMemo(() => {
    if (!subTabs) return {};
    const counts: Record<string, number> = {};
    for (const tab of subTabs) {
      if (tab.sectionDataKey) {
        counts[tab.key] = (multiSectionData[tab.sectionDataKey] ?? []).length;
      } else if (tab.categoryFilter) {
        counts[tab.key] = filterByCategory(
          singleSectionItems,
          tab.categoryFilter
        ).length;
      } else if (tab.filter) {
        counts[tab.key] = filterItems(mainItems, tab.filter).length;
      } else {
        // "전체" tab
        counts[tab.key] = sectionDataKey
          ? singleSectionItems.length
          : mainItems.length;
      }
    }
    return counts;
  }, [subTabs, mainItems, multiSectionData, singleSectionItems, sectionDataKey]);

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {title}
        </h1>

        {description && (
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            {description}
          </p>
        )}

        {/* Sub-tabs + search (same row) */}
        <div className="flex items-center gap-3 mb-8">
          {/* Tabs — 모바일: 스와이프, 검색 펼침 시 숨김 / 데스크탑: 항상 표시 */}
          {subTabs && (
            <div className={`${isSearchExpanded ? "hidden xl-nav:flex" : "flex"} flex-1 min-w-0 overflow-hidden`}>
              <div className="overflow-x-auto pb-5 -mb-5">
                <div className="flex gap-2 pb-1">
                {subTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${
                      activeTab === tab.key
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/15"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xxs opacity-50">
                      {tabCounts[tab.key] ?? 0}
                    </span>
                  </button>
                ))}
                </div>
              </div>
            </div>
          )}

          {/* 모바일 검색 — 아이콘 / 펼침 인풋 (subTabs 있는 페이지만) */}
          {subTabs && (
            <div className={`xl-nav:hidden ${isSearchExpanded ? "flex-1 min-w-0" : "shrink-0"}`}>
              {isSearchExpanded ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      ref={mobileSearchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="페이지 내 검색"
                      className="w-full pl-8 pr-3 h-10 text-base rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchExpanded(false);
                    }}
                    className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => mobileSearchRef.current?.focus(), 100);
                  }}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* 데스크탑 검색 (≥ xl-nav) + subTabs 없는 페이지 모바일 검색 */}
          <div className={`relative ${subTabs ? "hidden xl-nav:block" : "w-full"} xl-nav:shrink-0 xl-nav:w-[180px]`}>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="페이지 내 검색"
              className="w-full pl-8 pr-3 h-12 xl-nav:h-auto xl-nav:py-1.5 text-base xl-nav:text-xs rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <Skeleton count={6} />
        ) : displayItems.length === 0 ? (
          <EmptyState query={searchQuery} />
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {displayItems.length}개의 항목
              {searchQuery.trim() && (
                <span className="ml-1 text-gray-500">
                  &middot; &quot;{searchQuery}&quot; 검색 결과
                </span>
              )}
            </p>
            {resolvedCardLayout === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayItems.map((entry) => (
                  <VerticalCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayItems.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} showThumbnail={resolvedShowThumbnail} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
