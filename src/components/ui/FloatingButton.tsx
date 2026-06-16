"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSearchContext } from "@/components/search/SearchProvider";

const PRE_REGISTER_LINK = "https://tally.so/r/b5vGy7";

export function FloatingButton() {
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const { hasSearched, isSearchOpen } = useSearchContext();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCommunity = pathname.startsWith("/community");
  const isCommunityWrite = pathname === "/community/write";

  // 검색바가 하단에 있을 때 FloatingButton을 위로 이동
  const isSearchAtBottom = (isHome && hasSearched) || (!isHome && isSearchOpen);

  // 푸터 가시성 감지 → FAB 위치 조정
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    let isFooterInView = false;

    function updateOffset() {
      const rect = footer!.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setFooterVisible(true);
        setFooterOffset(window.innerHeight - rect.top + 32);
      } else {
        setFooterVisible(false);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isFooterInView = entry.isIntersecting;
        if (isFooterInView) {
          updateOffset();
          window.addEventListener("scroll", handleScroll, { passive: true });
        } else {
          setFooterVisible(false);
          window.removeEventListener("scroll", handleScroll);
        }
      },
      { threshold: 0 }
    );

    function handleScroll() {
      if (isFooterInView) updateOffset();
    }

    observer.observe(footer);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const bottomValue = footerVisible
    ? `${footerOffset}px`
    : isSearchAtBottom
      ? "96px"
      : "28px";

  /* ── 커뮤니티 글쓰기 페이지: 플로팅 버튼 숨김 ── */
  if (isCommunityWrite) return null;

  /* ── 커뮤니티: 글쓰기 플로팅 버튼 ── */
  if (isCommunity) {
    return (
      <div style={{ bottom: bottomValue }} className="fixed right-7 z-50 transition-[bottom] duration-200">
        {/* 데스크탑: 연필 아이콘 + 글쓰기 텍스트 */}
        <Link
          href="/community/write"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-bg-base text-sm font-bold shadow-lg shadow-white/20 hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          글쓰기
        </Link>
        {/* 모바일: 56px 원형 연필 아이콘 */}
        <Link
          href="/community/write"
          aria-label="글쓰기"
          className="sm:hidden flex items-center justify-center size-14 rounded-full bg-white text-bg-base shadow-lg shadow-white/20 hover:bg-gray-100 transition-all active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ bottom: bottomValue }} className="fixed right-7 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-200">
      {/* 허들링 클럽 사전 신청 CTA */}
      <div className="relative">
        <span className="absolute inset-0 rounded-[1000px] bg-white/20 animate-[floating-ripple_2s_ease-out_infinite]" />
        <span className="absolute inset-0 rounded-[1000px] bg-white/15 animate-[floating-ripple_2s_ease-out_0.6s_infinite]" />
        <span className="absolute inset-0 rounded-[1000px] bg-white/10 animate-[floating-ripple_2s_ease-out_1.2s_infinite]" />
        <a
          href={PRE_REGISTER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center rounded-[1000px] bg-white text-bg-base shadow-lg shadow-white/20 transition-transform hover:scale-105 active:scale-95 size-28"
        >
          <span className="text-center font-bold leading-tight text-sm select-none whitespace-nowrap">
            허들링 클럽
            <br />
            사전 신청
          </span>
        </a>
      </div>
    </div>
  );
}
