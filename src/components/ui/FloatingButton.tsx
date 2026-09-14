"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSearchContext } from "@/components/search/SearchProvider";

const PRE_REGISTER_LINK = "https://tally.so/r/GxVDYj";

export function FloatingButton() {
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const { hasSearched, isSearchOpen } = useSearchContext();
  const pathname = usePathname();
  const isHome = pathname === "/";

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
      { threshold: 0 },
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

  return (
    <div
      style={{ bottom: bottomValue }}
      className="fixed right-7 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-200"
    >
      {/* 허들링 클럽 사전 신청 CTA */}
      <div className="relative">
        <span className="absolute inset-0 rounded-[1000px] bg-white/20 animate-[floating-ripple_2s_ease-out_infinite]" />
        <span className="absolute inset-0 rounded-[1000px] bg-white/15 animate-[floating-ripple_2s_ease-out_0.6s_infinite]" />
        <span className="absolute inset-0 rounded-[1000px] bg-white/10 animate-[floating-ripple_2s_ease-out_1.2s_infinite]" />
        <a
          href={PRE_REGISTER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex flex-col items-center justify-center gap-1.5 rounded-[1000px] bg-white text-bg-base shadow-lg shadow-white/20 transition-transform hover:scale-105 active:scale-95 size-28"
        >
          <svg
            viewBox="0 0 17.3263 18.3972"
            fill="currentColor"
            className="size-7 select-none"
            aria-hidden="true"
          >
            <path d="M9.46716 10.4956C9.74074 10.1367 10.3195 10.267 10.4445 10.7006C11.0333 12.7453 12.0084 14.4015 12.9874 16.3377C13.106 16.5724 13.2056 16.7725 13.2889 16.9422C13.5272 17.428 13.3275 18.0107 12.8096 18.1674C12.0509 18.3971 11.297 18.3972 9.81783 18.3972C8.80005 18.3972 8.04146 18.1404 7.59487 17.9332C7.2927 17.7929 7.13301 17.4787 7.13289 17.1455C7.13285 16.9956 7.13282 16.8432 7.13289 16.7323C7.13313 16.4223 7.65561 13.0096 8.72181 11.4858C8.8033 11.3691 9.13929 10.9258 9.46716 10.4956Z" />
            <path d="M0.915748 7.38855C2.19128 7.39556 4.7023 7.43865 5.64834 7.66276C6.76446 7.92718 7.26957 7.96365 8.40587 8.45064C8.4881 8.48661 8.74069 8.55824 9.04968 8.6399C9.54882 8.77179 9.60179 9.49426 9.13532 9.7155C7.3639 10.5557 5.81261 11.6155 4.33496 13.0791C4.03221 13.323 3.6388 13.5688 3.29954 13.7645C2.87482 14.0095 2.34224 13.8931 2.04385 13.504C1.84343 13.2427 1.62076 12.9435 1.44613 12.6852C0.619147 11.5999 -0.10201 9.67906 0.0118951 8.14244C0.0457474 7.68613 0.458181 7.38604 0.915748 7.38855Z" />
            <path d="M12.4395 2.94385C12.5255 2.45941 13.1154 2.22475 13.4613 2.57467C13.9471 3.06576 14.4041 3.55622 14.8401 4.08473C14.9691 4.24126 15.1414 4.48311 15.2853 4.69174C15.4634 4.94997 15.5091 5.27614 15.4105 5.57395C15.3133 5.86742 15.1896 6.22426 15.1027 6.41545C14.643 7.6957 13.7374 8.4891 13.3547 8.68979C13.1573 8.79328 12.7183 8.87732 12.3393 8.93446C12.004 8.98501 11.724 8.69568 11.7712 8.35991C12.0547 6.34113 12.2716 5.11409 12.4108 3.16556C12.4158 3.09525 12.4259 3.02031 12.4395 2.94385Z" />
            <path d="M3.05556 1.06456C4.11392 0.169041 6.33611 -0.0870812 7.77394 0.0245283C8.58278 0.317359 8.82377 1.39081 9.07916 2.11169C9.58272 3.53178 10.0436 4.96767 10.4533 6.42059C10.5524 6.77249 10.6608 7.16642 10.754 7.54917C10.7697 7.61371 10.771 7.69328 10.7638 7.77709C10.7368 8.09387 10.3786 8.23241 10.1011 8.07727C9.75783 7.8854 9.35197 7.64187 9.22668 7.49869C7.26558 5.87244 4.75401 4.28228 2.47253 3.05717C2.4699 3.0552 2.46595 3.05255 2.46595 3.05255V3.05192C2.0366 2.80898 2.04513 2.22662 2.41542 1.70205C2.59596 1.44666 2.82972 1.24379 3.05556 1.06456Z" />
            <path d="M12.1089 9.98506C13.6022 10.4374 15.6289 10.2147 16.6878 10.2147C17.6652 10.2147 17.2587 12.4882 17.1493 13.0654C17.1099 13.2736 17.0073 13.5523 16.9089 13.791C16.7821 14.0983 16.4704 14.2926 16.1583 14.178C15.6808 14.0026 15.1258 13.6363 14.5429 13.2283C13.7284 12.6582 12.6152 11.9794 11.6107 10.6762C11.424 10.434 11.7249 9.86874 12.1089 9.98506Z" />
          </svg>
          <span className="text-center font-bold leading-tight text-sm select-none whitespace-nowrap">
            허들링 클럽
            <br />
            3기 대기 신청
          </span>
        </a>
      </div>
    </div>
  );
}
