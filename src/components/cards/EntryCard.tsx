"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SearchIndexItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";
import { useThumbnail } from "@/hooks/useThumbnail";

interface EntryCardProps {
  entry: SearchIndexItem;
  showThumbnail?: boolean;
}

function isOptimizableUrl(url: string): boolean {
  return url.includes("amazonaws.com") || url.includes("notion.so");
}

export function EntryCard({ entry, showThumbnail = false }: EntryCardProps) {
  const displayThumbnail = useThumbnail(entry, showThumbnail);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isShortcut = !!entry.shortcut;

  useEffect(() => {
    setImageLoaded(false);
  }, [displayThumbnail]);

  const handleCopy = () => {
    if (!entry.shortcut) return;
    navigator.clipboard.writeText(entry.shortcut).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const cardInner = (
    <div className={`flex gap-3 sm:gap-4 ${entry.shortcut ? "flex-col sm:flex-row sm:items-center sm:justify-between" : showThumbnail ? "flex-row items-start" : "items-center justify-between"}`}>
      {showThumbnail && (
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white/6 flex items-center justify-center relative">
          {displayThumbnail ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-white/10" />
              )}
              <Image
                src={displayThumbnail}
                alt=""
                width={80}
                height={80}
                sizes="80px"
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
                unoptimized={!isOptimizableUrl(displayThumbnail)}
              />
            </>
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
        <h3 className={`font-semibold text-gray-100 transition-colors ${!isShortcut ? "group-hover:text-blue-400" : ""}`}>
          {entry.title}
        </h3>
        <EntryMeta author={entry.author} publishedDate={entry.publishedDate} className="mt-2" />
      </div>

      {entry.shortcut && (
        <span
          onClick={handleCopy}
          className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.07] border text-sm font-mono whitespace-normal break-words sm:whitespace-nowrap transition-colors ${
            copied
              ? "border-green-400/50 text-green-300"
              : "border-white/10 text-gray-300 group-hover:border-blue-400/50 group-hover:text-blue-300"
          }`}
        >
          {copied ? "복사됨!" : entry.shortcut}
        </span>
      )}
    </div>
  );

  if (isShortcut) {
    return (
      <div className="group block rounded-xl border border-white/10 bg-white/5 p-5 cursor-default hover:border-white/20 hover:bg-white/[0.08] transition-all">
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/[0.08] transition-all"
    >
      {cardInner}
    </Link>
  );
}
