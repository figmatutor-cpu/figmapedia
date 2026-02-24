"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SearchIndexItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";

interface EntryCardProps {
  entry: SearchIndexItem;
  showThumbnail?: boolean;
}

/** 썸네일 없고 링크 있는 항목은 OG 이미지를 lazy 로드 */
function useOgImage(link: string | null | undefined, enabled: boolean) {
  const [ogImage, setOgImage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !link) return;
    fetch(`/api/og-image?url=${encodeURIComponent(link)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ogImage) setOgImage(data.ogImage);
      })
      .catch(() => {});
  }, [link, enabled]);

  return ogImage;
}

export function EntryCard({ entry, showThumbnail = false }: EntryCardProps) {
  const needsOg = showThumbnail && !entry.thumbnail && !!entry.link;
  const ogImage = useOgImage(entry.link, needsOg);
  const displayThumbnail = entry.thumbnail || ogImage;

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/[0.08] transition-all"
    >
      <div className={`flex gap-3 sm:gap-4 ${entry.shortcut ? "flex-col sm:flex-row sm:items-center sm:justify-between" : showThumbnail ? "flex-row items-start" : "items-center justify-between"}`}>
        {showThumbnail && (
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white/6 flex items-center justify-center">
            {displayThumbnail ? (
              <Image
                src={displayThumbnail}
                alt=""
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {entry.categories.map((cat) => (
              <Badge key={cat} category={cat} />
            ))}
          </div>
          <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
            {entry.title}
          </h3>
          <EntryMeta author={entry.author} publishedDate={entry.publishedDate} className="mt-2" />
        </div>

        {entry.shortcut && (
          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.07] border border-white/10 text-sm text-gray-300 font-mono whitespace-normal break-words sm:whitespace-nowrap">
            {entry.shortcut}
          </span>
        )}
      </div>
    </Link>
  );
}
