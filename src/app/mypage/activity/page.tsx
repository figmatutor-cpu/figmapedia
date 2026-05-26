import { ActivityList } from "@/components/mypage/ActivityList";
import { requireMember } from "@/lib/auth/require-member";

export const dynamic = "force-dynamic";

interface ActivityRow {
  id: string;
  type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const STAT_TYPES = [
  { key: "vote", label: "투표 참여" },
  { key: "share", label: "결과 공유" },
  { key: "live_attend", label: "라이브 시청" },
  { key: "comment", label: "댓글 작성" },
] as const;

export default async function MyPageActivityPage() {
  const { supabase, user } = await requireMember();

  let activities: ActivityRow[] = [];
  let totalCount = 0;
  let typeCounts: Record<string, number> = {};

  try {
    const [{ data: rows, count }, ...stats] = await Promise.all([
      supabase
        .from("member_activities")
        .select("id, type, target_type, target_id, metadata, created_at", {
          count: "exact",
        })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      ...STAT_TYPES.map((t) =>
        supabase
          .from("member_activities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", t.key),
      ),
    ]);

    activities = (rows ?? []) as ActivityRow[];
    totalCount = count ?? 0;
    typeCounts = STAT_TYPES.reduce<Record<string, number>>(
      (acc, t, i) => ({ ...acc, [t.key]: stats[i].count ?? 0 }),
      {},
    );
  } catch (e) {
    console.warn(
      "[mypage/activity] member_activities table missing — run migration 0003",
      e,
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-h3-lg font-semibold text-fg-1">활동 이력</h2>
        <p className="mt-1 text-body text-fg-3">
          AI 실험실에서의 모든 활동을 확인하세요.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="총 활동" value={totalCount} highlight />
          {STAT_TYPES.map((t) => (
            <Metric
              key={t.key}
              label={t.label}
              value={typeCounts[t.key] ?? 0}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-body font-semibold text-fg-1">최근 활동</h3>
        <ActivityList activities={activities} />
        {totalCount > 30 && (
          <p className="mt-4 text-xxs text-fg-4">
            최근 30건만 표시됩니다. 전체 이력은 운영자에게 문의해주세요.
          </p>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-brand-blue/30 bg-brand-blue/10"
          : "border-border-1 bg-glass-2"
      }`}
    >
      <div className="text-xxs text-fg-4">{label}</div>
      <div className="mt-2 text-h2 font-semibold text-fg-1">{value}</div>
    </div>
  );
}
