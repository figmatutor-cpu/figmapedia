"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CommunityPost, CommunityComment } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
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

/* ── 비밀번호 확인 모달 ── */
function PasswordModal({
  title,
  onConfirm,
  onClose,
  isLoading,
  error,
}: {
  title: string;
  onConfirm: (password: string) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string;
}) {
  const [password, setPassword] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-white/10 bg-modal-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none mb-3"
          style={{ fontSize: "16px" }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && password.trim()) onConfirm(password.trim());
          }}
        />
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 border border-white/10 hover:border-white/20 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => password.trim() && onConfirm(password.trim())}
            disabled={isLoading || !password.trim()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comment form
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "post"; id: string } | { type: "comment"; id: string } | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments ?? []);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!nickname.trim()) {
      setCommentError("닉네임을 입력해주세요.");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("댓글 내용을 입력해주세요.");
      return;
    }
    if (commentPassword.trim().length < 4) {
      setCommentError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          nickname: nickname.trim(),
          content: commentText.trim(),
          password: commentPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.error || "댓글 작성에 실패했습니다.");
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
      setCommentPassword("");
    } catch {
      setCommentError("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (password: string) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const url =
        deleteTarget.type === "post"
          ? `/api/community/posts/${deleteTarget.id}`
          : `/api/community/comments/${deleteTarget.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "삭제에 실패했습니다.");
        return;
      }

      if (deleteTarget.type === "post") {
        router.push("/community");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      setDeleteError("삭제에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-1/3" />
            <div className="h-8 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-40 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-lg text-gray-400 mb-4">
            게시글을 찾을 수 없습니다
          </p>
          <Link
            href="/community"
            className="text-sm text-[var(--brand-blue)] hover:underline"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          목록
        </Link>

        {/* Post */}
        <article className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
              {post.category}
            </span>
            <button
              type="button"
              onClick={() => setDeleteTarget({ type: "post", id: post.id })}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <span className="text-gray-300">{post.nickname}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.content && (
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap border-t border-white/10 pt-4">
              {post.content}
            </div>
          )}
        </article>

        {/* Comments */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-white mb-3">
            댓글 {comments.length}개
          </h2>

          {comments.length > 0 && (
            <div className="space-y-3 mb-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">
                        {comment.nickname}
                      </span>
                      <span className="text-xxs text-gray-600">
                        {formatRelative(comment.created_at)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: "comment", id: comment.id })}
                      className="text-xxs text-gray-600 hover:text-red-400 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          <form
            onSubmit={handleCommentSubmit}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                maxLength={20}
                className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
              <input
                type="password"
                value={commentPassword}
                onChange={(e) => setCommentPassword(e.target.value)}
                placeholder="비밀번호 (4자 이상)"
                maxLength={30}
                className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div className="mb-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 작성하세요"
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none resize-y min-h-[60px]"
                style={{ fontSize: "16px" }}
              />
            </div>
            {commentError && (
              <p className="text-xs text-red-400 mb-2">{commentError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-white text-bg-base text-sm font-bold shadow-lg shadow-white/20 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? "작성 중..." : "댓글 작성"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Password Modal */}
      {deleteTarget && (
        <PasswordModal
          title={
            deleteTarget.type === "post"
              ? "게시글을 삭제하시겠습니까?"
              : "댓글을 삭제하시겠습니까?"
          }
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
          isLoading={deleteLoading}
          error={deleteError}
        />
      )}
    </div>
  );
}
