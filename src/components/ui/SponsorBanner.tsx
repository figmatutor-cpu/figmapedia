"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "huddling-club-3rd-banner-dismissed";
const SPONSOR_URL = "https://tally.so/r/GxVDYj";

interface SponsorBannerProps {
  className?: string;
}

export function SponsorBanner({ className }: SponsorBannerProps) {
  // Hydration mismatch 방지 — 초기엔 숨김, 마운트 후 localStorage 읽기
  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setIsDismissed(true);
      }
    } catch {
      // private mode 등 sessionStorage 미지원 환경 — 무시
    }
  }, []);

  const handleClose = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // noop
    }
  };

  if (!isMounted || isDismissed) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-colors mb-6",
        className,
      )}
    >
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 pr-12 text-sm text-gray-200 sm:pr-14"
      >
        <span className="flex-1 text-left sm:text-center">
          <span className="font-medium text-white">
            성장하는 실무자들을 위한 AI 커뮤니티,
          </span>{" "}
          <span className="text-gray-300">허들링 클럽 3기 대기 신청</span>
        </span>
        <span className="hidden shrink-0 items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-gray-100 sm:inline-flex">
          바로가기
        </span>
      </a>
      <button
        type="button"
        onClick={handleClose}
        aria-label="배너 닫기"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
