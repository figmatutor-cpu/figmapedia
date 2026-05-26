"use client";

import { useState, useMemo } from "react";
import { VerticalCard } from "@/components/cards/VerticalCard";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SubTab } from "@/lib/navigation";
import type { SearchIndexItem } from "@/types";

interface KioskMasonryLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  heroTitle?: React.ReactNode;
  subTabs?: SubTab[];
  initialSectionItems: SearchIndexItem[];
}

export function KioskMasonryLayout({
  title,
  description,
  eyebrow,
  heroTitle,
  subTabs,
  initialSectionItems,
}: KioskMasonryLayoutProps) {
  const [activeTab, setActiveTab] = useState(subTabs?.[0]?.key ?? null);

  const baseItems = useMemo<SearchIndexItem[]>(() => {
    const tab = subTabs?.find((t) => t.key === activeTab);
    if (tab?.categoryFilter) {
      return initialSectionItems.filter((it) =>
        it.categories.some((c) => tab.categoryFilter!.includes(c)),
      );
    }
    return initialSectionItems;
  }, [subTabs, activeTab, initialSectionItems]);

  return (
    <div className="min-h-screen bg-bg-base pt-10 xl-nav:pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-6 xl-nav:px-10">
        <SponsorBanner />

        {/* Editorial hero */}
        <header className="mt-6 mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
            <h1
              className="text-h1 xl-nav:text-display font-bold tracking-tight
                         leading-[1.1] text-fg-1 text-balance"
            >
              {heroTitle ?? title}
            </h1>
            {description && (
              <p className="mt-3 text-body text-fg-3 leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
        </header>

        {/* Tabs */}
        {subTabs && (
          <div className="flex gap-1.5 flex-wrap mb-6">
            {subTabs.map((t) => {
              const active = t.key === activeTab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3.5 py-1.5 rounded-full text-meta font-medium border transition-colors
                              ${
                                active
                                  ? "bg-glass-3 border-border-2 text-fg-1"
                                  : "bg-glass-1 border-border-1 text-fg-3 hover:text-fg-1 hover:border-border-2"
                              }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Masonry */}
        {baseItems.length === 0 ? (
          <EmptyState query="" />
        ) : (
          <div className="columns-2 md:columns-3 xl-nav:columns-4 gap-4 [column-fill:_balance]">
            {baseItems.map((entry) => (
              <div key={entry.id} className="break-inside-avoid mb-4">
                <VerticalCard entry={entry} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
