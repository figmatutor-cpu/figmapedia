"use client";

import { useState, useRef, useEffect } from "react";

const KAKAO_LINK = "https://open.kakao.com/o/gPjVAOXf";
const YOUTUBE_LINK = "https://www.youtube.com/playlist?list=PLPM-mNLGkfO_UJ2ThrNqnoEIE9j5Ac4bH";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">
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
