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
    <div className="rounded-xl border border-border-1 bg-glass-1 p-6">
      <h3 className="text-body font-semibold text-fg-1">실험실 활동 요약</h3>
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
      <div className="text-h2 font-semibold text-fg-1 md:text-h1">{value}</div>
      <div className="mt-1 text-meta text-fg-3">{label}</div>
    </div>
  );
}
