import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicCard } from "@/components/ai-lab/vote/TopicCard";
import { getTopicsByWeek } from "@/lib/supabase/topics";

export const revalidate = 3600;

function isValidWeek(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

function formatWeek(week: string): string {
  const d = new Date(`${week}T00:00:00`);
  if (Number.isNaN(d.getTime())) return week;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ week: string }>;
}): Promise<Metadata> {
  const { week } = await params;
  if (!isValidWeek(week)) return { title: "주제 투표 결과 | AI 실험실" };

  const data = await getTopicsByWeek(week);
  const winner = data?.topics.find((t) => t.status === "winner");
  const title = winner
    ? `${formatWeek(week)} 주차 선정: ${winner.title} | AI 실험실`
    : `${formatWeek(week)} 주차 주제 투표 결과 | AI 실험실`;
  return {
    title,
    description:
      winner?.description ??
      "디자이너의 AI 실험실 주간 주제 투표 결과를 확인하세요.",
    openGraph: {
      title,
      description:
        winner?.description ??
        "디자이너의 AI 실험실 주간 주제 투표 결과를 확인하세요.",
      type: "article",
    },
  };
}

export default async function WeekVoteResultPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!isValidWeek(week)) notFound();

  const data = await getTopicsByWeek(week);
  if (!data) notFound();

  const winner = data.topics.find((t) => t.status === "winner");

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-3xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/ai-lab" className="transition hover:text-gray-300">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <Link href="/ai-lab/vote" className="transition hover:text-gray-300">
            주제 투표
          </Link>
          <span aria-hidden>›</span>
          <span className="text-gray-400">{formatWeek(week)}</span>
        </nav>

        <header className="mb-8">
          <p className="mb-2 text-xxs uppercase tracking-widest text-gray-500">
            {formatWeek(week)} 주차
          </p>
          <h1 className="text-2xl font-semibold leading-snug text-white md:text-3xl">
            주제 투표 결과
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>총 {data.total_votes}표</span>
            <span aria-hidden>·</span>
            <span>{data.is_closed ? "투표 마감" : "진행 중"}</span>
          </div>
        </header>

        {winner && (
          <section className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xxs font-medium text-emerald-300">
              선정 주제
            </span>
            <h2 className="mt-3 text-lg font-semibold text-white">
              {winner.title}
            </h2>
            {winner.description && (
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {winner.description}
              </p>
            )}
          </section>
        )}

        <section className="space-y-3">
          {data.topics.map((t) => (
            <TopicCard
              key={t.id}
              topic={t}
              totalVotes={data.total_votes}
              selected={false}
              disabled
              showStatusBadge
            />
          ))}
        </section>

        <section className="mt-10">
          <Link
            href="/ai-lab/vote"
            className="inline-block rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-2"
          >
            이번 주 투표 보러가기 →
          </Link>
        </section>
      </div>
    </main>
  );
}
