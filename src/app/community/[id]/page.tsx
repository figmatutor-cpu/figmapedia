"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CommunityPost, CommunityComment } from "@/types";
import { useMember } from "@/lib/auth/use-member";

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

/* ── 삭제 확인 모달 ── */
function ConfirmDeleteModal({
  title,
  onConfirm,
  onClose,
  isLoading,
  error,
}: {
  title: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  error: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border-1 bg-modal-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-body font-bold text-fg-1 mb-3">{title}</h3>
        <p className="text-meta text-fg-3 mb-4">삭제하면 되돌릴 수 없습니다.</p>
        {error && <p className="text-meta text-red-400 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-body text-fg-3 border border-border-1 hover:border-border-2 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-fg-1 text-body font-bold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  const { user, isAdmin } = useMember();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comment form
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
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

  const canDelete = (ownerId: string | null) =>
    Boolean(user && ownerId && (user.id === ownerId || isAdmin));

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!user) {
      setCommentError("로그인이 필요합니다.");
      return;
    }
    if (!nickname.trim()) {
      setCommentError("닉네임을 입력해주세요.");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("댓글 내용을 입력해주세요.");
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.error || "댓글 작성에 실패했습니다.");
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    } catch {
      setCommentError("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const url =
        deleteTarget.type === "post"
          ? `/api/community/posts/${deleteTarget.id}`
          : `/api/community/comments/${deleteTarget.id}`;

      const res = await fetch(url, { method: "DELETE" });

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
            <div className="h-6 bg-glass-3 rounded w-1/3" />
            <div className="h-8 bg-glass-3 rounded w-3/4" />
            <div className="h-4 bg-glass-3 rounded w-1/2" />
            <div className="h-40 bg-glass-3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-h3 text-fg-3 mb-4">게시글을 찾을 수 없습니다</p>
          <Link
            href="/community"
            className="text-body text-[var(--brand-blue)] hover:underline"
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
          className="inline-flex items-center gap-1 text-body text-fg-3 hover:text-fg-1 transition-colors mb-4"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          목록
        </Link>

        {/* Post */}
        <article className="rounded-xl border border-border-1 bg-glass-1 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-meta px-2 py-0.5 rounded-full border border-border-1 text-fg-3">
              {post.category}
            </span>
            {canDelete(post.user_id) && (
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: "post", id: post.id })}
                className="text-meta text-fg-5 hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
          <h1 className="text-h3 font-bold text-fg-1 mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-meta text-fg-4 mb-4">
            <span className="text-fg-2">{post.nickname}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.content && (
            <div className="text-body text-fg-2 leading-relaxed whitespace-pre-wrap border-t border-border-1 pt-4">
              {post.content}
            </div>
          )}
        </article>

        {/* Comments */}
        <div className="mb-6">
          <h2 className="text-body-lg font-medium text-fg-1 mb-3">
            댓글 {comments.length}개
          </h2>

          {comments.length > 0 && (
            <div className="space-y-3 mb-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-border-1 bg-glass-1 p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-meta font-medium text-fg-2">
                        {comment.nickname}
                      </span>
                      <span className="text-xxs text-fg-5">
                        {formatRelative(comment.created_at)}
                      </span>
                    </div>
                    {canDelete(comment.user_id) && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "comment",
                            id: comment.id,
                          })
                        }
                        className="text-xxs text-fg-5 hover:text-red-400 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-body text-fg-3 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          {user ? (
            <form
              onSubmit={handleCommentSubmit}
              className="rounded-xl border border-border-1 bg-glass-1 p-4"
            >
              <div className="mb-3">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임"
                  maxLength={20}
                  className="w-full min-w-0 px-3 py-2 rounded-lg bg-glass-1 border border-border-1 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-lg bg-glass-1 border border-border-1 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none resize-y min-h-[60px]"
                  style={{ fontSize: "16px" }}
                />
              </div>
              {commentError && (
                <p className="text-meta text-red-400 mb-2">{commentError}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-surface-inverse text-bg-base text-body font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "작성 중..." : "댓글 작성"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-border-1 bg-glass-1 p-5 text-center">
              <p className="text-body text-fg-3 mb-3">
                댓글을 작성하려면 로그인이 필요합니다.
              </p>
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/community/${postId}`)}`}
                className="inline-block px-5 py-2.5 rounded-lg bg-surface-inverse text-bg-base text-body font-bold transition-colors"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
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
