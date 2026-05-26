"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VerticalCard } from "@/components/cards/VerticalCard";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SubTab } from "@/lib/navigation";
import type { SearchIndexItem } from "@/types";

interface UXUIMagazineLayoutProps {
  title: string;
  description?: string;
  subTabs: SubTab[];
  initialMultiSectionData: Record<string, SearchIndexItem[]>;
}

function isOptimizable(url?: string) {
  if (!url) return false;
  return (
    url.startsWith("/") ||
    url.includes("amazonaws.com") ||
    url.includes("notion.so") ||
    url.includes("supabase.co")
  );
}

function FeatureCard({
  entry,
  externalLink,
}: {
  entry: SearchIndexItem;
  externalLink: boolean;
}) {
  const cat = entry.categories[0];
  const dateLabel = entry.publishedDate
    ? new Date(entry.publishedDate).toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
    : null;

  const inner = (
    <div
      className="relative aspect-[21/9] xl-nav:aspect-[21/8] rounded-2xl overflow-hidden
                 border border-border-2 bg-glass-2 group"
    >
      {entry.thumbnail ? (
        isOptimizable(entry.thumbnail) ? (
          <Image
            src={entry.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1080px) 1100px, 100vw"
            className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity"
            loading="lazy"
          />
        )
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--fp-brand-blue) 0%, var(--fp-bg-base) 70%)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 60%, rgba(83,109,254,0.45), transparent 50%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.35), transparent 55%), linear-gradient(180deg, transparent 40%, rgba(5,5,16,0.85) 100%)",
        }}
      />

      <div className="absolute inset-0 p-6 xl-nav:p-12 flex flex-col justify-end">
        <div className="font-mono text-[11px] xl-nav:text-meta text-fg-3 mb-2.5 tracking-wider uppercase">
          FEATURED
          {cat && <> · {cat}</>}
          {dateLabel && <> · {dateLabel}</>}
        </div>
        <h2 className="text-h2 xl-nav:text-[44px] font-bold text-fg-1 tracking-tight leading-[1.1] max-w-3xl text-balance">
          {entry.title}
        </h2>
        {entry.author && (
          <div className="text-body text-fg-3 mt-3">{entry.author}</div>
        )}
      </div>
    </div>
  );

  if (externalLink && entry.link) {
    return (
      <a
        href={entry.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline text-inherit"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block no-underline text-inherit"
    >
      {inner}
    </Link>
  );
}

export function UXUIMagazineLayout({
  title,
  description,
  subTabs,
  initialMultiSectionData,
}: UXUIMagazineLayoutProps) {
  const [activeTabKey, setActiveTabKey] = useState(subTabs[0]?.key ?? "");
  const activeTab = subTabs.find((t) => t.key === activeTabKey) ?? subTabs[0];

  const items = useMemo<SearchIndexItem[]>(() => {
    if (!activeTab?.sectionDataKey) return [];
    return initialMultiSectionData[activeTab.sectionDataKey] ?? [];
  }, [activeTab, initialMultiSectionData]);

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <div className="min-h-screen bg-bg-base pt-10 xl-nav:pt-14 pb-16">
      <div className="mx-auto max-w-7xl px-6 xl-nav:px-10">
        <SponsorBanner />

        {/* Editorial centered hero */}
        <header className="mt-10 mb-10 xl-nav:mb-14 text-center">
          <div className="eyebrow inline-flex items-center gap-2 mb-3">
            <span className="block w-6 h-px bg-border-2" />
            {title} · EDITORIAL
            <span className="block w-6 h-px bg-border-2" />
          </div>
          <h1 className="text-h1 xl-nav:text-display-lg font-semibold tracking-tight leading-[1.05] text-balance text-fg-1 mx-auto max-w-2xl">
            디자이너의 사고법,
            <br />
            지식으로부터.
          </h1>
          {description && (
            <p className="mt-4 text-body text-fg-3 max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </header>

        {/* Tabs (centered) */}
        {subTabs.length > 1 && (
          <div className="flex gap-1.5 justify-center mb-10 flex-wrap">
            {subTabs.map((t) => {
              const active = t.key === activeTabKey;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTabKey(t.key)}
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

        {items.length === 0 ? (
          <EmptyState query="" />
        ) : (
          <>
            {/* Featured hero card */}
            {featured && (
              <div className="mb-8 xl-nav:mb-10">
                <FeatureCard
                  entry={featured}
                  externalLink={activeTab?.externalLink ?? false}
                />
              </div>
            )}

            {/* Asymmetric article grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl-nav:grid-cols-3 gap-5">
                {rest.map((entry, i) => (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <div className="font-mono text-[11px] tracking-wider text-fg-4">
                      {String(i + 2).padStart(2, "0")}
                      {entry.categories[0] && (
                        <> · {entry.categories[0].toUpperCase()}</>
                      )}
                    </div>
                    <VerticalCard
                      entry={entry}
                      externalLink={activeTab?.externalLink ?? false}
                      showTags={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
