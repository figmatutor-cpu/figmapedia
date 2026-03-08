"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchIcon } from "@/components/ui/SearchIcon";
import type { CommunityPost } from "@/types";

const CATEGORIES = ["전체", "일반", "질문", "정보공유", "피드백"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (category !== "전체") params.set("category", category);
      const res = await fetch(`/api/community/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  // 클라이언트 검색 필터
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.nickname.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-2">
          커뮤니티
        </h1>
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          자유롭게 질문하고 정보를 공유하세요
        </p>

        {/* Category Tabs + Search */}
        <div className="flex items-center gap-3 mb-8 overflow-hidden">
          {/* 탭 — 모바일: 검색 펼침 시 숨김 */}
          <div className={`${isSearchExpanded ? "hidden xl-nav:flex" : "flex"} flex-1 min-w-0 overflow-hidden`}>
            <SegmentedControl
              tabs={CATEGORIES.map((cat) => ({ key: cat, label: cat }))}
              activeTab={category}
              onTabChange={handleCategoryChange}
            />
          </div>

          {/* 모바일 검색 — 아이콘 / 펼침 인풋 */}
          <div className={`xl-nav:hidden ${isSearchExpanded ? "flex-1 min-w-0" : "shrink-0"}`}>
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="페이지 내 검색"
                    className="w-full pl-8 pr-3 h-10 text-base rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchExpanded(false);
                  }}
                  className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSearchExpanded(true);
                  setTimeout(() => mobileSearchRef.current?.focus(), 100);
                }}
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 데스크탑 검색 (≥ xl-nav) */}
          <div className="relative hidden xl-nav:block xl-nav:shrink-0 xl-nav:w-[180px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="페이지 내 검색"
              className="w-full pl-8 pr-3 h-12 text-base xl-nav:text-sm rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
            />
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">아직 게시글이 없습니다</p>
              <p className="text-sm">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xxs px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xxs text-gray-500">
                      <span>{post.nickname}</span>
                      <span>·</span>
                      <span>{formatDate(post.created_at)}</span>
                      {(post.comment_count ?? 0) > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-gray-400">
                            댓글 {post.comment_count}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="text-xs text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
