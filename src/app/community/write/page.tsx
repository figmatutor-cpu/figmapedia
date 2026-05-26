"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["일반", "질문", "정보공유", "피드백"];

export default function CommunityWritePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("일반");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    if (content.trim().length < 30) {
      setError("내용은 최소 30자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          title: title.trim(),
          content: content.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "글 작성에 실패했습니다.");
        return;
      }

      router.push(`/community/${data.post.id}`);
    } catch {
      setError("글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h3-lg font-bold text-fg-1">글쓰기</h1>
          <Link
            href="/community"
            className="text-body text-fg-3 hover:text-fg-1 transition-colors"
          >
            취소
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="block text-meta text-fg-3 mb-1.5">닉네임 *</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-3 py-2.5 rounded-lg bg-glass-1 border border-border-1 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-meta text-fg-3 mb-1.5">카테고리</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-meta font-medium border transition-colors ${
                    category === cat
                      ? "bg-brand-blue-accent border-brand-blue-accent text-fg-1"
                      : "bg-glass-1 border-border-1 text-fg-3 hover:text-fg-2 hover:border-border-2"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-meta text-fg-3 mb-1.5">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={200}
              className="w-full px-3 py-2.5 rounded-lg bg-glass-1 border border-border-1 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-meta text-fg-3 mb-1.5">
              내용 * <span className="text-fg-5">(최소 30자)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요 (최소 30자)"
              rows={10}
              maxLength={10000}
              className="w-full px-3 py-2.5 rounded-lg bg-glass-1 border border-border-1 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none resize-y min-h-[120px]"
              style={{ fontSize: "16px" }}
            />
            <p
              className={`text-xxs mt-1 text-right ${content.trim().length > 0 && content.trim().length < 30 ? "text-red-400" : "text-fg-5"}`}
            >
              {content.trim().length} / 10000
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-body text-red-400">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-surface-inverse text-bg-base text-body font-bold shadow-lg shadow-white/20 hover:bg-surface-inverse transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? "작성 중..." : "작성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
