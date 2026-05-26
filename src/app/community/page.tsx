"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchIcon } from "@/components/ui/SearchIcon";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
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
    let list = posts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.nickname.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q),
      );
    }
    // 고정글 항상 상단
    return [...list].sort(
      (a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0),
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-bg-base pt-28 xl-nav:pt-10 pb-16">
      <div className="mx-auto max-w-4xl xl-nav:max-w-7xl px-4 xl-nav:px-10">
        <SponsorBanner />

        {/* Editorial header — desktop only */}
        <header className="hidden xl-nav:flex items-end justify-between gap-4 mt-8 mb-8">
          <div>
            <div className="eyebrow mb-1.5">커뮤니티</div>
            <h1 className="text-display font-semibold tracking-tight leading-[1.05] text-fg-1">
              같이 디자인하는 공간
            </h1>
            <p className="mt-3 text-body text-fg-3 leading-relaxed">
              자유롭게 질문하고 정보를 공유하세요
            </p>
          </div>
          <Link
            href="/community/write"
            className="h-11 px-5 inline-flex items-center gap-2 rounded-lg
                       bg-glass-3 border border-border-2 text-fg-1 text-body font-semibold
                       hover:bg-glass-4 hover:border-border-3 transition-colors"
          >
            글쓰기
          </Link>
        </header>

        {/* Mobile header */}
        <div className="xl-nav:hidden">
          <h1 className="text-h3-lg font-bold text-fg-1 mb-2">커뮤니티</h1>
          <p className="text-fg-3 mb-6 text-body sm:text-body-lg">
            자유롭게 질문하고 정보를 공유하세요
          </p>
        </div>

        {/* Desktop: feed + sidebar */}
        <div className="xl-nav:grid xl-nav:grid-cols-[1fr_320px] xl-nav:gap-10">
          <div className="min-w-0">
            {/* Category Tabs + Search */}
            <div className="flex items-center gap-3 mb-8 overflow-hidden">
              {/* 탭 — 모바일: 검색 펼침 시 숨김 */}
              <div
                className={`${isSearchExpanded ? "hidden xl-nav:flex" : "flex"} flex-1 min-w-0 overflow-hidden`}
              >
                <SegmentedControl
                  tabs={CATEGORIES.map((cat) => ({ key: cat, label: cat }))}
                  activeTab={category}
                  onTabChange={handleCategoryChange}
                />
              </div>

              {/* 모바일 검색 — 아이콘 / 펼침 인풋 */}
              <div
                className={`xl-nav:hidden ${isSearchExpanded ? "flex-1 min-w-0" : "shrink-0"}`}
              >
                {isSearchExpanded ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-4" />
                      <input
                        ref={mobileSearchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="페이지 내 검색"
                        className="w-full pl-8 pr-3 h-10 text-body-lg rounded-lg bg-glass-1 border border-border-1 text-fg-2 placeholder-fg-4 focus:outline-none focus:border-border-3 focus:bg-glass-2 transition-colors"
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchExpanded(false);
                      }}
                      className="shrink-0 p-2 text-fg-3 hover:text-fg-1 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="페이지 내 검색"
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setTimeout(() => mobileSearchRef.current?.focus(), 100);
                    }}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-glass-1 border border-border-1 text-fg-3 hover:text-fg-1 hover:border-border-2 transition-colors"
                  >
                    <SearchIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 데스크탑 검색 (≥ xl-nav) */}
              <div className="relative hidden xl-nav:block xl-nav:shrink-0 xl-nav:w-[180px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="페이지 내 검색"
                  className="w-full pl-8 pr-3 h-12 text-body-lg xl-nav:text-body rounded-lg bg-glass-1 border border-border-1 text-fg-2 placeholder-fg-4 focus:outline-none focus:border-border-3 focus:bg-glass-2 transition-colors"
                />
              </div>
            </div>

            {/* Post List */}
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border-1 bg-glass-1 p-4 animate-pulse"
                  >
                    <div className="h-4 bg-glass-3 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-glass-3 rounded w-1/3" />
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 text-fg-4">
                  <p className="text-h3 mb-2">아직 게시글이 없습니다</p>
                  <p className="text-body">첫 번째 글을 작성해보세요!</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className={`block rounded-xl border p-4 transition-colors ${
                      post.is_pinned
                        ? "border-brand-blue/30 bg-brand-blue/5 hover:border-brand-blue/50 hover:bg-brand-blue/10"
                        : "border-border-1 bg-glass-1 hover:border-border-2 hover:bg-glass-2"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.is_pinned && post.pin_label && (
                            <span className="text-xxs px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue-accent font-medium">
                              {post.pin_label}
                            </span>
                          )}
                          <span className="text-xxs px-2 py-0.5 rounded-full border border-border-1 text-fg-3">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-body-lg font-medium text-fg-1 truncate">
                          {post.is_pinned && (
                            <svg
                              className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5 text-brand-blue-accent"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          )}
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-body text-fg-4">
                          <span>{post.nickname}</span>
                          <span>·</span>
                          <span>{formatDate(post.created_at)}</span>
                          {(post.comment_count ?? 0) > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-fg-3">
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
                  className="px-3 py-1.5 rounded-lg text-meta border border-border-1 text-fg-3 hover:border-border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="text-meta text-fg-4">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-meta border border-border-1 text-fg-3 hover:border-border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden xl-nav:flex flex-col gap-7 min-w-0">
            {/* 통계 카드 */}
            <div className="rounded-xl border border-border-1 bg-glass-2 p-4">
              <div className="eyebrow mb-2">이번 주 활동</div>
              <div className="grid grid-cols-2 gap-3 text-fg-1">
                <div>
                  <div className="text-h2 font-semibold tracking-tight">
                    {posts.length}
                  </div>
                  <div className="text-[11px] text-fg-4 mt-0.5">전체 글</div>
                </div>
                <div>
                  <div className="text-h2 font-semibold tracking-tight">
                    {posts.reduce((sum, p) => sum + (p.comment_count ?? 0), 0)}
                  </div>
                  <div className="text-[11px] text-fg-4 mt-0.5">댓글</div>
                </div>
              </div>
            </div>

            {/* 인기 카테고리 */}
            <div>
              <div className="eyebrow mb-3">카테고리</div>
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.filter((c) => c !== "전체").map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-body
                                  border transition-colors
                                  ${
                                    category === cat
                                      ? "bg-glass-3 border-border-2 text-fg-1"
                                      : "border-border-1 text-fg-2 hover:bg-glass-1 hover:border-border-2"
                                  }`}
                    >
                      <span>{cat}</span>
                      <span className="text-meta text-fg-4">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 글쓰기 CTA */}
            <div className="rounded-xl border border-border-1 bg-glass-2 p-4">
              <div className="eyebrow mb-2">참여하기</div>
              <p className="text-body text-fg-2 leading-relaxed mb-3">
                오늘 마주친 디자인 이슈를 공유해보세요.
              </p>
              <Link
                href="/community/write"
                className="block w-full h-10 rounded-lg
                           bg-[var(--fp-brand-blue-accent)] text-fg-1 text-body font-semibold
                           inline-flex items-center justify-center
                           hover:opacity-90 transition-opacity"
              >
                글쓰기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
