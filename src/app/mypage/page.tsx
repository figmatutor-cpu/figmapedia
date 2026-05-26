import Link from "next/link";
import { DiscordLinkPanel } from "@/components/mypage/DiscordLinkPanel";
import { ProfileSummary } from "@/components/mypage/ProfileSummary";
import { requireMember } from "@/lib/auth/require-member";
import { type MemberRole } from "@/types/member";

export const dynamic = "force-dynamic";

interface MemberRow {
  role: MemberRole;
  plan_type: "monthly" | "annual" | null;
  subscription_status: string | null;
  subscribed_at: string | null;
  next_billing_at: string | null;
  expires_at: string | null;
  discord_id: string | null;
  created_at: string;
}

interface ActivityCounts {
  total: number;
  votes: number;
  shares: number;
  badges: number;
}

async function fetchMemberRow(
  userId: string,
  supabase: Awaited<
    ReturnType<
      typeof import("@/lib/supabase/server").createSupabaseServerClient
    >
  >,
): Promise<MemberRow | null> {
  const { data, error } = await supabase
    .from("members")
    .select(
      "role, plan_type, subscription_status, subscribed_at, next_billing_at, expires_at, discord_id, created_at",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as MemberRow;
}

async function fetchActivityCounts(
  userId: string,
  supabase: Awaited<
    ReturnType<
      typeof import("@/lib/supabase/server").createSupabaseServerClient
    >
  >,
): Promise<ActivityCounts> {
  const empty: ActivityCounts = { total: 0, votes: 0, shares: 0, badges: 0 };
  try {
    const [total, votes, shares, badges] = await Promise.all([
      supabase
        .from("member_activities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("member_activities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "vote"),
      supabase
        .from("member_activities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "share"),
      supabase
        .from("member_badges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);
    return {
      total: total.count ?? 0,
      votes: votes.count ?? 0,
      shares: shares.count ?? 0,
      badges: badges.count ?? 0,
    };
  } catch (e) {
    console.warn(
      "[mypage] activity counts unavailable (migration 0003 needed?)",
      e,
    );
    return empty;
  }
}

export default async function MyPageDashboard() {
  const { supabase, user } = await requireMember();
  const [memberRow, counts] = await Promise.all([
    fetchMemberRow(user.id, supabase),
    fetchActivityCounts(user.id, supabase),
  ]);

  if (!memberRow) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-status-danger/10 p-8">
        <p className="text-body text-red-300">
          회원 정보를 불러올 수 없습니다. 운영자에게 문의해주세요.
        </p>
      </div>
    );
  }

  const quickLinks = [
    {
      href: "/mypage/billing",
      label: "구독 관리",
      desc: "다음 결제일·자동 갱신·해지",
    },
    {
      href: "/mypage/activity",
      label: "활동 이력",
      desc: `이번 달 ${counts.total}건`,
    },
    { href: "/mypage/badges", label: "뱃지", desc: `획득 ${counts.badges}개` },
  ];

  return (
    <div className="space-y-6">
      <ProfileSummary user={user} member={memberRow} />

      <DiscordLinkPanel initialDiscordId={memberRow.discord_id} />

      <section>
        <h2 className="mb-4 text-body font-semibold text-fg-1">활동 요약</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="총 활동" value={counts.total} />
          <Metric label="투표 참여" value={counts.votes} />
          <Metric label="공유" value={counts.shares} />
          <Metric label="획득 뱃지" value={counts.badges} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-body font-semibold text-fg-1">빠른 작업</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="block rounded-xl border border-border-1 bg-glass-2 p-5 transition hover:border-border-2 hover:bg-glass-3"
            >
              <div className="text-body-lg font-semibold text-fg-1">
                {q.label}
              </div>
              <p className="mt-2 text-body text-fg-3">{q.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-1 bg-glass-2 p-4">
      <div className="text-xxs text-fg-4">{label}</div>
      <div className="mt-2 text-h2 font-semibold text-fg-1">{value}</div>
    </div>
  );
}
