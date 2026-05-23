import Link from "next/link";
import { ActivityStats } from "@/components/ai-lab/ActivityStats";
import { AiLabHeader } from "@/components/ai-lab/AiLabHeader";
import { DiscordPanel } from "@/components/ai-lab/DiscordPanel";
import { ReportListItem } from "@/components/ai-lab/ReportListItem";
import { ThisWeekHero } from "@/components/ai-lab/ThisWeekHero";
import { VotingActiveCard } from "@/components/ai-lab/VotingActiveCard";
import { WinnerTopicHero } from "@/components/ai-lab/WinnerTopicHero";
import { getAllExperiments } from "@/lib/mdx/experiments";
import { getCurrentTopics } from "@/lib/supabase/topics";

export const revalidate = 300;

export default async function AiLabPage() {
  const [experiments, topicsData] = await Promise.all([
    getAllExperiments(),
    getCurrentTopics(),
  ]);

  const winner = topicsData.topics.find((t) => t.status === "winner");
  const candidates = topicsData.topics.filter((t) => t.status === "candidate");
  const hasActiveVoting =
    !topicsData.is_closed &&
    candidates.length > 0 &&
    !!topicsData.voting_closes_at;

  const [latest, ...past] = experiments;
  const recentReports = past.slice(0, 3);

  let heroSection: React.ReactNode = null;
  if (winner) {
    heroSection = (
      <WinnerTopicHero topic={winner} totalVotes={topicsData.total_votes} />
    );
  } else if (hasActiveVoting && topicsData.voting_closes_at) {
    heroSection = (
      <VotingActiveCard
        closesAt={topicsData.voting_closes_at}
        candidatesCount={candidates.length}
        totalVotes={topicsData.total_votes}
      />
    );
  } else if (latest) {
    heroSection = <ThisWeekHero experiment={latest} />;
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        <AiLabHeader />

        {heroSection && <section className="mt-10">{heroSection}</section>}

        {!heroSection && experiments.length === 0 && (
          <section className="mt-10 rounded-xl border border-border-1 bg-glass-1 p-12 text-center">
            <p className="text-sm text-gray-400">
              첫 실험 리포트가 곧 공개됩니다.
            </p>
          </section>
        )}

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div id="past-experiments">
            <h2 className="mb-4 text-sm font-semibold text-white">
              최신 리포트
            </h2>
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((exp) => (
                  <ReportListItem key={exp.slug} experiment={exp} />
                ))}
                <div className="pt-2">
                  <Link
                    href="/ai-lab/archive"
                    className="inline-block rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-xs font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-2"
                  >
                    리포트 전체 보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
                <p className="text-xs text-gray-500">
                  지난 리포트가 곧 추가됩니다.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <ActivityStats experiments={0} reports={0} members={0} />
            <DiscordPanel />
          </aside>
        </section>
      </div>
    </main>
  );
}
