"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchContext } from "./SearchProvider";
import { SearchInput } from "./SearchInput";
import {
  SEARCH_PLACEHOLDER,
  SEARCH_SUGGESTIONS,
  TYPING_ANIMATION,
} from "@/lib/constants";

export function HeroSearch() {
  const { query, setQuery, triggerAISearch, isAISearching } = useSearchContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(SEARCH_PLACEHOLDER);
  const typingStateRef = useRef({
    suggestionIndex: 0,
    charIndex: 0,
    deleting: false,
    running: true,
  });
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    typingStateRef.current.running = true;
    const { typeSpeed, deleteSpeed, pauseAtEnd, pauseBetween } = TYPING_ANIMATION;

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
        setAnimatedPlaceholder(SEARCH_PLACEHOLDER);
        schedule(step, 300);
        return;
      }

      const state = typingStateRef.current;
      const current = SEARCH_SUGGESTIONS[state.suggestionIndex % SEARCH_SUGGESTIONS.length] || "";

      if (!state.deleting) {
        const nextIndex = state.charIndex + 1;
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(SEARCH_PLACEHOLDER + next);
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
        setAnimatedPlaceholder(SEARCH_PLACEHOLDER + next);
        state.charIndex = nextIndex;
        if (nextIndex <= 0) {
          state.deleting = false;
          state.suggestionIndex = (state.suggestionIndex + 1) % SEARCH_SUGGESTIONS.length;
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

  return (
    <SearchInput
      ref={inputRef}
      query={query}
      onQueryChange={setQuery}
      onSearch={triggerAISearch}
      isSearching={isAISearching}
      placeholder={animatedPlaceholder}
      variant="hero"
      className="w-full max-w-[600px] mx-auto"
    />
  );
}
