import Link from "next/link";
import { CountdownTimer } from "@/components/ai-lab/vote/CountdownTimer";
import type { CurrentTopicsResponse } from "@/types/topic";

interface WeeklyVoteCardProps {
  data: CurrentTopicsResponse;
}

/**
 * AI 실험실 메인 페이지에 "항상" 표시되는 이번 주 주제 카드.
 * 상태별 분기:
 *  - candidates 있고 마감 전 → 후보 리스트 + 카운트다운 + "투표하러 가기"
 *  - winner 결정됨 → 당선 주제 표시 + 결과 보기
 *  - 없음 → "다음 주 투표 예정" placeholder
 */
export function WeeklyVoteCard({ data }: WeeklyVoteCardProps) {
  const { topics, total_votes, voting_closes_at, is_closed } = data;
  const winner = topics.find((t) => t.status === "winner");
  const candidates = topics.filter((t) => t.status === "candidate");
  const hasActiveVoting =
    !is_closed && candidates.length > 0 && !!voting_closes_at;

  // 가장 많은 표를 받은 후보 (lead 표시용)
  const maxVotes = Math.max(...candidates.map((c) => c.votes), 0);

  return (
    <article
      className="rounded-2xl border border-border-1 bg-glass-2 p-6 md:p-8
                 flex flex-col gap-4 h-full"
    >
      <header>
        <div className="text-meta font-medium text-[var(--fp-brand-blue-accent)] mb-1.5">
          이번 주 투표
        </div>
        <h3 className="fp-display text-h2 font-semibold tracking-tight leading-tight text-fg-1">
          {winner
            ? winner.title
            : hasActiveVoting
              ? "이번 주 실험 주제를 함께 정해요"
              : "다음 주 투표가 곧 시작됩니다"}
        </h3>
      </header>

      {winner ? (
        <div className="rounded-lg border border-[var(--fp-brand-blue-accent)]/40 bg-[rgba(83,109,254,0.06)] p-4">
          <div className="text-meta text-[var(--fp-brand-blue-accent)] font-medium mb-1.5">
            ★ 당선 주제
          </div>
          {winner.description && (
            <p className="text-body text-fg-2 leading-relaxed">
              {winner.description}
            </p>
          )}
          <div className="mt-3 text-xxs text-fg-4">
            총 {total_votes}표 · 멤버 투표 완료
          </div>
        </div>
      ) : hasActiveVoting ? (
        <div className="flex flex-col gap-2.5">
          {candidates.slice(0, 4).map((c) => {
            const pct =
              total_votes > 0 ? Math.round((c.votes / total_votes) * 100) : 0;
            const isLead = c.votes === maxVotes && c.votes > 0;
            return (
              <div
                key={c.id}
                className={`relative rounded-lg border overflow-hidden
                            ${
                              isLead
                                ? "border-[var(--fp-brand-blue-accent)]/50"
                                : "border-border-1"
                            }`}
              >
                <div
                  className="absolute inset-y-0 left-0 transition-all"
                  style={{
                    width: `${pct}%`,
                    background: isLead
                      ? "rgba(83,109,254,0.12)"
                      : "rgba(255,255,255,0.04)",
                  }}
                />
                <div className="relative flex items-center justify-between px-3.5 py-2.5">
                  <span
                    className={`text-body leading-snug ${
                      isLead ? "font-semibold text-fg-1" : "text-fg-2"
                    }`}
                  >
                    {c.title}
                  </span>
                  <span
                    className={`text-meta font-medium shrink-0 ml-3 ${
                      isLead
                        ? "text-[var(--fp-brand-blue-accent)]"
                        : "text-fg-4"
                    }`}
                  >
                    {pct}% · {c.votes}표
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-body text-fg-3 leading-relaxed">
          매주 멤버가 직접 다음 주 실험 주제를 정합니다. 새 투표가 시작되면
          이곳에 후보가 표시돼요.
        </p>
      )}

      <footer className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3 text-meta">
        <div className="text-fg-4 flex items-center gap-2 flex-wrap">
          {hasActiveVoting && voting_closes_at ? (
            <>
              <CountdownTimer targetIso={voting_closes_at} />
              <span aria-hidden>·</span>
              <span>총 {total_votes}표</span>
            </>
          ) : (
            <span>매주 일요일 밤 마감</span>
          )}
        </div>
        <Link
          href="/ai-lab/vote"
          className="text-[var(--fp-brand-blue-accent)] font-medium hover:underline"
        >
          {hasActiveVoting ? "투표하러 가기 →" : "지난 투표 보기 →"}
        </Link>
      </footer>
    </article>
  );
}
