"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "figmapedia-sponsor-banner-dismissed";
const SPONSOR_URL = "https://tally.so/r/b5rJp0";

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
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setIsDismissed(true);
      }
    } catch {
      // private mode 등 localStorage 미지원 환경 — 무시
    }
  }, []);

  const handleClose = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // noop
    }
  };

  if (!isMounted || isDismissed) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-colors mb-6",
        className
      )}
    >
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 pr-14 text-sm text-gray-200"
      >
        <span className="flex-1 text-center">
          <span className="font-medium text-white">
            월간 조회수 9만회, 활성 유저 2.5만명!
          </span>{" "}
          <span className="text-gray-300">
            피그마 피디아의 첫 광고주가 되어보세요.
          </span>
        </span>
        <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-gray-100">
          신청하기
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
