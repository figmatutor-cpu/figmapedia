"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SearchIndexItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";

interface VerticalCardProps {
  entry: SearchIndexItem;
  /** 카테고리 태그 표시 여부 */
  showTags?: boolean;
  /** 작성자/날짜 표시 여부 */
  showMeta?: boolean;
}

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

export function VerticalCard({
  entry,
  showTags = true,
  showMeta = true,
}: VerticalCardProps) {
  const needsOg = !entry.thumbnail && !!entry.link;
  const ogImage = useOgImage(entry.link, needsOg);
  const displayThumbnail = entry.thumbnail || ogImage;

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 hover:bg-white/[0.08] transition-all"
    >
      {/* 썸네일 영역 */}
      <div className="aspect-[4/3] bg-white/6 flex items-center justify-center overflow-hidden">
        {displayThumbnail ? (
          <Image
            src={displayThumbnail}
            alt=""
            width={400}
            height={300}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <svg
            className="w-10 h-10 text-white/15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex-1 flex flex-col">
        {showTags && entry.categories.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {entry.categories.map((cat) => (
              <Badge key={cat} category={cat} />
            ))}
          </div>
        )}

        <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2 text-sm sm:text-base">
          {entry.title}
        </h3>

        {showMeta && <EntryMeta author={entry.author} publishedDate={entry.publishedDate} className="mt-auto pt-2" />}
      </div>
    </Link>
  );
}
