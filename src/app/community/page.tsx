"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">커뮤니티</h1>
            <p className="text-sm text-gray-400 mt-1">
              자유롭게 질문하고 정보를 공유하세요
            </p>
          </div>
          <Link
            href="/community/write"
            className="px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-bold shadow-[0_0_12px_rgba(31,61,188,0.4)] hover:bg-brand-blue-accent hover:shadow-[0_0_20px_rgba(31,61,188,0.6)] transition-all"
          >
            글쓰기
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
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
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">아직 게시글이 없습니다</p>
              <p className="text-sm">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            posts.map((post) => (
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
