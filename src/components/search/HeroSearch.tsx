"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchContext } from "./SearchProvider";

const BASE_PLACEHOLDER = "검색어를 입력하세요 ";
const SUGGESTIONS = [
  "오토 레이아웃",
  "컴포넌트 만들기",
  "베리어블 사용법",
  "프로토타이핑 팁",
  "플러그인 추천",
  "피그마에서 정렬하는 방법은?",
  "디자인 시스템 구축 관련 팁",
];

export function HeroSearch() {
  const { query, setQuery, triggerAISearch, isAISearching } = useSearchContext();
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(BASE_PLACEHOLDER);
  const typingStateRef = useRef({
    suggestionIndex: 0,
    charIndex: 0,
    deleting: false,
    running: true,
  });
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    typingStateRef.current.running = true;
    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseAtEnd = 1200;
    const pauseBetween = 500;

    function schedule(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    }

    function clearTimers() {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    }

    function step() {
      if (!typingStateRef.current.running) return;

      if (query !== "") {
        setAnimatedPlaceholder(BASE_PLACEHOLDER);
        schedule(step, 300);
        return;
      }

      const state = typingStateRef.current;
      const current = SUGGESTIONS[state.suggestionIndex % SUGGESTIONS.length] || "";

      if (!state.deleting) {
        const nextIndex = state.charIndex + 1;
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(BASE_PLACEHOLDER + next);
        state.charIndex = nextIndex;
        if (nextIndex >= current.length) {
          schedule(() => {
            state.deleting = true;
            step();
          }, pauseAtEnd);
        } else {
          schedule(step, typeSpeed);
        }
      } else {
        const nextIndex = Math.max(0, state.charIndex - 1);
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(BASE_PLACEHOLDER + next);
        state.charIndex = nextIndex;
        if (nextIndex <= 0) {
          state.deleting = false;
          state.suggestionIndex = (state.suggestionIndex + 1) % SUGGESTIONS.length;
          schedule(step, pauseBetween);
        } else {
          schedule(step, deleteSpeed);
        }
      }
    }

    clearTimers();
    schedule(step, 400);

    return () => {
      typingStateRef.current.running = false;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim() && !isAISearching) {
      e.preventDefault();
      triggerAISearch();
    }
  };

  const handleSearchClick = () => {
    if (query.trim() && !isAISearching) {
      triggerAISearch();
    }
  };

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div className="relative rounded-2xl p-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.06)] bg-linear-to-br from-white/10 via-white/5 to-black/20">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={animatedPlaceholder}
            className="w-full rounded-2xl bg-[rgba(15,15,20,0.55)] border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#1f3dbc]/40 focus:border-[#1f3dbc]/40 backdrop-blur-md pl-12 pr-[100px] py-4 text-base"
            autoComplete="off"
            lang="ko"
          />
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={isAISearching || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-[#f0f2ff] text-black text-sm font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isAISearching ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "AI 검색"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
