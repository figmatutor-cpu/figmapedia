import Link from "next/link";
import type { TopicWithVotes } from "@/types/topic";

interface WinnerTopicHeroProps {
  topic: TopicWithVotes;
  totalVotes: number;
}

export function WinnerTopicHero({ topic, totalVotes }: WinnerTopicHeroProps) {
  const pct = totalVotes > 0 ? Math.round((topic.votes / totalVotes) * 100) : 0;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3 text-xxs">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-medium text-emerald-300">
          이번 주 선정 주제
        </span>
        <span className="text-fg-4">
          {topic.votes}표 · {pct}% 득표
        </span>
      </div>

      <h2 className="mt-4 text-h3-lg font-semibold text-fg-1 md:text-h2">
        {topic.title}
      </h2>

      {topic.description && (
        <p className="mt-3 line-clamp-4 whitespace-pre-line text-body leading-6 text-fg-2 md:text-body-lg">
          {topic.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/ai-lab/vote/${topic.week}`}
          className="rounded-full bg-emerald-500/20 px-5 py-2.5 text-body font-medium text-emerald-200 transition hover:bg-emerald-500/30"
        >
          투표 결과 보기
        </Link>
        <Link
          href="/ai-lab/live"
          className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
        >
          라이브 일정
        </Link>
      </div>
    </div>
  );
}
