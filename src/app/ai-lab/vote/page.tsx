import Link from "next/link";
import { CountdownTimer } from "@/components/ai-lab/vote/CountdownTimer";
import { VoteCenter } from "@/components/ai-lab/vote/VoteCenter";
import { getCurrentTopics } from "@/lib/supabase/topics";

export const dynamic = "force-dynamic";

function formatWeek(week: string | null): string | null {
  if (!week) return null;
  const d = new Date(`${week}T00:00:00`);
  if (Number.isNaN(d.getTime())) return week;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default async function VotePage() {
  const data = await getCurrentTopics();
  const weekLabel = formatWeek(data.week);

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-3xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/ai-lab" className="transition hover:text-fg-2">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">주제 투표</span>
        </nav>

        <header className="mb-8">
          <p className="mb-2 text-xxs uppercase tracking-widest text-brand-blue-light">
            이번 주 주제 투표
          </p>
          <h1 className="text-h2 font-semibold leading-snug text-fg-1 md:text-h1">
            이번 주 실험할 주제를 함께 정해요
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-fg-4">
            {weekLabel && (
              <>
                <span>{weekLabel} 주차</span>
                <span aria-hidden>·</span>
              </>
            )}
            {data.voting_closes_at && !data.is_closed && (
              <CountdownTimer targetIso={data.voting_closes_at} />
            )}
            {data.is_closed && <span>투표 마감</span>}
            <span aria-hidden>·</span>
            <span>총 {data.total_votes}표</span>
          </div>
        </header>

        <VoteCenter initialData={data} />

        <section className="mt-12 rounded-xl border border-border-1 bg-glass-1 p-5 text-meta leading-6 text-fg-4">
          <p className="font-medium text-fg-2">참여 규칙</p>
          <ul className="mt-2 space-y-1">
            <li>· 주당 1인 1표. 다른 후보 클릭 시 자동으로 표가 이동합니다.</li>
            <li>
              · 마감 시각이 지나면 가장 많은 표를 받은 후보가 이번 주 실험
              주제로 선정됩니다.
            </li>
            <li>
              · 결과는 누구나 볼 수 있습니다. 투표는 무료 회원 이상이면
              가능합니다.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
