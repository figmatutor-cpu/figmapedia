"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { FigmaResource } from "@/lib/resource-data";
import { Badge } from "@/components/ui/Badge";

interface ResourceCardProps {
  resource: FigmaResource;
  variant?: "default" | "wide";
  /** 서버에서 Supabase 조회된 썸네일 URL */
  cachedThumbnail?: string;
}

export function ResourceCard({ resource, variant = "default", cachedThumbnail }: ResourceCardProps) {
  const [ogImage, setOgImage] = useState<string | null>(
    cachedThumbnail ?? resource.thumbnail ?? null,
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [fetched, setFetched] = useState(
    !!(cachedThumbnail || resource.thumbnail),
  );
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // 이미 썸네일이 있으면 스킵
    if (fetched) return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFetched(true);
          observer.disconnect();

          fetch(`/api/og-image?url=${encodeURIComponent(resource.url)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.ogImage) setOgImage(data.ogImage);
            })
            .catch(() => {});
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [resource.url, fetched]);

  return (
    <a
      ref={cardRef}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col rounded-xl border overflow-hidden transition-all ${
        resource.category === "template"
          ? "border-yellow-400/20 bg-yellow-400/[0.03] hover:border-yellow-400/40 hover:bg-yellow-400/[0.06]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
      }`}
    >
      <div className={`${variant === "wide" ? "aspect-video" : "aspect-[4/3]"} bg-white/6 flex items-center justify-center overflow-hidden relative`}>
        {ogImage && !imageFailed ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-white/10" />
            )}
            <Image
              src={ogImage}
              alt={`${resource.title} 썸네일`}
              width={variant === "wide" ? 640 : 400}
              height={variant === "wide" ? 360 : 300}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
              unoptimized
            />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${fetched ? "" : "animate-pulse bg-white/5"}`}>
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
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium transition-colors line-clamp-2 ${
              resource.category === "template"
                ? "text-gray-100 group-hover:text-yellow-300"
                : "text-gray-200 group-hover:text-brand-blue"
            }`}
          >
            {resource.title}
          </h3>
          <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-auto pt-2">
          <Badge
            category={
              resource.category === "template"
                ? "템플릿"
                : resource.category === "class"
                  ? "수업자료"
                  : resource.category === "live"
                    ? "주간 라이브"
                    : "Figma A to Z"
            }
          />
        </div>
      </div>
    </a>
  );
}
