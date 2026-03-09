"use client";

import { useState, useMemo } from "react";
import { FIGMA_RESOURCES } from "@/lib/resource-data";
import type { ResourceCategory } from "@/lib/resource-data";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchIcon } from "@/components/ui/SearchIcon";

type TabKey = "all" | ResourceCategory;

interface Props {
  cachedThumbnails: Record<string, string>;
}

export function FigmaResourceClient({ cachedThumbnails }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: FIGMA_RESOURCES.length };
    for (const r of FIGMA_RESOURCES) {
      c[r.category] = (c[r.category] ?? 0) + 1;
    }
    return c;
  }, []);

  const tabItems = useMemo(
    () => [
      { key: "all", label: "전체", count: counts.all },
      { key: "template", label: "템플릿", count: counts.template ?? 0 },
      { key: "class", label: "수업자료", count: counts.class ?? 0 },
      { key: "live", label: "주간 라이브", count: counts.live ?? 0 },
      { key: "atoz", label: "Figma A to Z", count: counts.atoz ?? 0 },
    ],
    [counts]
  );

  const displayItems = useMemo(() => {
    let items =
      activeTab === "all"
        ? FIGMA_RESOURCES
        : FIGMA_RESOURCES.filter((r) => r.category === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((r) => r.title.toLowerCase().includes(q));
    }

    return items;
  }, [activeTab, searchQuery]);

  return (
    <main className="min-h-screen bg-base pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-2">
          피그마 리소스
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          피그마 디자인 템플릿, 튜토리얼, 프로토타이핑 예제 모음
        </p>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 min-w-0 overflow-hidden">
            <SegmentedControl
              tabs={tabItems}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key as TabKey)}
            />
          </div>

          {/* Desktop search */}
          <div className="relative shrink-0 w-[180px] hidden sm:block">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="페이지 내 검색"
              className="w-full pl-8 pr-3 h-11 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="페이지 내 검색"
              className="w-full pl-8 pr-3 h-12 text-base rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Item count */}
        <p className="text-sm text-gray-400 mb-4">
          {displayItems.length}개의 항목
          {searchQuery.trim() && (
            <span className="ml-1 text-gray-500">
              &middot; &quot;{searchQuery}&quot; 검색 결과
            </span>
          )}
        </p>

        {/* Cards grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((resource) => (
              <ResourceCard
                key={resource.url}
                resource={resource}
                variant="wide"
                cachedThumbnail={cachedThumbnails[resource.url]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {searchQuery.trim()
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : "항목이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
