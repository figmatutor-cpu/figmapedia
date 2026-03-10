"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSearchContext } from "@/components/search/SearchProvider";

const INQUIRY_LINK = "https://open.kakao.com/o/gtzKe0lf";
const KAKAO_LINK = "https://open.kakao.com/o/gPjVAOXf";
const YOUTUBE_LINK = "https://www.youtube.com/playlist?list=PLPM-mNLGkfO_UJ2ThrNqnoEIE9j5Ac4bH";
const DONATE_LINK = "https://buymeacoffee.com/figmapedia";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingButton() {
  const [open, setOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

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
    <div ref={containerRef} style={{ bottom: bottomValue }} className="fixed right-7 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-200">
      {/* 모달 */}
      {open && (
        <div className="w-[305px] sm:w-[335px] rounded-3xl overflow-hidden shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* 헤더 */}
          <div className="bg-[#202128] px-6 pt-5 pb-6">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-0.5"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="text-white text-lg font-bold leading-[1.4]">
              피그마 피디아<br />
              사이트에 오신걸 환영합니다.👋
            </p>
          </div>

          {/* 콘텐츠 */}
          <div className="bg-[#202128] px-4 pt-4 pb-6 flex flex-col gap-4">
            {/* 운영진 문의 */}
            <div>
              <p className="text-white text-[15px] font-bold mb-2 ml-1">피그마 피디아 운영진 문의 채널</p>
              <a
                href={INQUIRY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#2a2a36] rounded-xl p-3 hover:bg-[#333340] transition-colors group"
              >
                <span className="flex-1 text-[15px] text-white">홍보 및 제휴 문의하기</span>
                <ChevronRight />
              </a>
            </div>

            {/* 오픈카톡방 */}
            <div>
              <p className="text-white text-[15px] font-bold mb-2 ml-1">피그마 피디아 오픈 카톡방</p>
              <a
                href={KAKAO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#2a2a36] rounded-xl p-3 hover:bg-[#333340] transition-colors group"
              >
                <span className="flex-1 text-[15px] text-white">참여하기(pw:figma)</span>
                <ChevronRight />
              </a>
            </div>

            {/* 주간 라이브 */}
            <div>
              <p className="text-white text-[15px] font-bold mb-2 ml-1">주간 라이브</p>
              <a
                href={YOUTUBE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#2a2a36] rounded-xl p-3 hover:bg-[#333340] transition-colors group"
              >
                <span className="flex-1 text-[15px] text-white">라이브 보러가기</span>
                <ChevronRight />
              </a>
            </div>

            {/* 후원하기 */}
            <div>
              <p className="text-white text-[15px] font-bold mb-2 ml-1">후원하기</p>
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#2a2a36] rounded-xl p-3 hover:bg-[#333340] transition-colors group"
              >
                <span className="flex-1 text-[15px] text-white">피그마 피디아 팀에게 커피 사기</span>
                <ChevronRight />
              </a>
            </div>

            {/* 푸터 */}
            <p className="text-center text-[10px] text-gray-400 tracking-wide">
              Powered by Figmapedia
            </p>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <div className="relative">
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-white/20 animate-[floating-ripple_2s_ease-out_infinite]" />
            <span className="absolute inset-0 rounded-full bg-white/15 animate-[floating-ripple_2s_ease-out_0.6s_infinite]" />
            <span className="absolute inset-0 rounded-full bg-white/10 animate-[floating-ripple_2s_ease-out_1.2s_infinite]" />
          </>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative flex items-center justify-center rounded-full bg-white text-bg-base shadow-lg shadow-white/20 transition-transform hover:scale-110 active:scale-95 size-16"
        >
          <span className="text-center font-bold leading-tight text-[13px] select-none">
            Figma
            <br />
            Pedia
          </span>
        </button>
      </div>
    </div>
  );
}
