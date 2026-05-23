import Link from "next/link";
import { CountdownTimer } from "@/components/ai-lab/vote/CountdownTimer";

interface VotingActiveCardProps {
  closesAt: string;
  candidatesCount: number;
  totalVotes: number;
}

export function VotingActiveCard({
  closesAt,
  candidatesCount,
  totalVotes,
}: VotingActiveCardProps) {
  return (
    <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3 text-xxs">
        <span className="rounded-full border border-brand-blue/40 bg-brand-blue/15 px-3 py-1 font-medium text-brand-blue-light">
          투표 진행 중
        </span>
        <CountdownTimer targetIso={closesAt} />
      </div>

      <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">
        이번 주 실험 주제를 함께 정해요
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-300 md:text-base">
        디자이너의 AI 실험실은 매주 멤버가 직접 주제를 정합니다. 후보를 확인하고
        한 표를 던져주세요.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xxs text-gray-500">
        <span>후보 {candidatesCount}개</span>
        <span aria-hidden>·</span>
        <span>총 {totalVotes}표</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/ai-lab/vote"
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
        >
          투표 보러가기 →
        </Link>
        <Link
          href="/membership"
          className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-2"
        >
          멤버십 알아보기
        </Link>
      </div>
    </div>
  );
}
