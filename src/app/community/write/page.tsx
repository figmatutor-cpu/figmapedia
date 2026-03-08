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
  const [password, setPassword] = useState("");
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
    if (password.trim().length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
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
          password: password.trim(),
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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">글쓰기</h1>
          <Link
            href="/community"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            취소
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              닉네임 *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              카테고리
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === cat
                      ? "bg-brand-blue-accent border-brand-blue-accent text-white"
                      : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/15"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={200}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              내용 * <span className="text-gray-600">(최소 30자)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요 (최소 30자)"
              rows={10}
              maxLength={10000}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none resize-y min-h-[120px]"
              style={{ fontSize: "16px" }}
            />
            <p className={`text-xxs mt-1 text-right ${content.trim().length > 0 && content.trim().length < 30 ? "text-red-400" : "text-gray-600"}`}>
              {content.trim().length} / 10000
            </p>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              비밀번호 * <span className="text-gray-600">(삭제 시 필요)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (4자 이상)"
              maxLength={30}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-white text-bg-base text-sm font-bold shadow-lg shadow-white/20 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? "작성 중..." : "작성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
