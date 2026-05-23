interface ActivityStatsProps {
  experiments: number;
  reports: number;
  members: number;
}

export function ActivityStats({
  experiments,
  reports,
  members,
}: ActivityStatsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold text-white">실험실 활동 요약</h3>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <StatItem value={experiments} label="진행된 실험" />
        <StatItem value={reports} label="제출된 리포트" />
        <StatItem value={members} label="참여 멤버" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-white md:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-gray-400">{label}</div>
    </div>
  );
}
