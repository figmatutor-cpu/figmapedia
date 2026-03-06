"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Search, Check } from "lucide-react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

interface FilterModalProps {
  categories: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function FilterModal({ categories, selected, onChange }: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // categories prop은 외부 useMemo로 최적화된 값이 전달됨
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape 키로 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function toggleCategory(cat: string) {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  }

  return (
    <div className="relative shrink-0">

      {/* 필터 토글 버튼 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-9 h-9 inline-flex items-center justify-center rounded-lg border transition-colors ${
          selected.length > 0 || isOpen
            ? "bg-white/10 border-white/20 text-[rgba(153,161,175,1)]"
            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* 모달 */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-glass-overlay backdrop-blur-md z-50 overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white">카테고리 필터</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 검색 인풋 — 선택된 뱃지 가로 나열, 고정 높이, overflow clip */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 focus-within:border-white/25 focus-within:bg-white/[0.07] transition-colors">
              {selected.length === 0 && <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
              {selected.map((cat) => {
                const badgeColor = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
                return (
                  <span
                    key={cat}
                    className={`shrink-0 inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded text-xs font-medium ${badgeColor}`}
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={selected.length > 0 ? "" : "카테고리 검색 또는 선택"}
                className="flex-1 min-w-[3rem] bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          {/* 카테고리 체크박스 목록 — 고정 높이 + 커스텀 스크롤 */}
          <div className="px-2 pb-3">
            <div className="max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
              {filteredCategories.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-500">결과 없음</p>
              ) : (
                filteredCategories.map((cat) => {
                  const isChecked = selected.includes(cat);
                  const badgeColor = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
                  return (
                    <div
                      key={cat}
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                    >
                      {/* 커스텀 체크박스 */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked
                            ? "bg-brand-blue-accent border-brand-blue-accent"
                            : "border-white/20 bg-transparent group-hover:border-white/40"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      {/* 카테고리 뱃지 — CATEGORY_COLORS 전체 클래스(bg + text) 적용 */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-opacity ${badgeColor} ${
                          isChecked ? "opacity-100" : "opacity-60 group-hover:opacity-90"
                        }`}
                      >
                        {cat}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
