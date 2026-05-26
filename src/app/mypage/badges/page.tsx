import { BadgeList } from "@/components/mypage/BadgeList";
import { requireMember } from "@/lib/auth/require-member";

export const dynamic = "force-dynamic";

interface BadgeRow {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon: string | null;
}

interface MemberBadgeRow {
  earned_at: string;
  badges: BadgeRow | null;
}

export default async function MyPageBadgesPage() {
  const { supabase, user } = await requireMember();

  let earned: (BadgeRow & { earned_at: string })[] = [];
  let available: BadgeRow[] = [];

  try {
    const [earnedRes, availableRes] = await Promise.all([
      supabase
        .from("member_badges")
        .select("earned_at, badges ( id, code, label, description, icon )")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false }),
      supabase
        .from("badges")
        .select("id, code, label, description, icon")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
    ]);

    earned = ((earnedRes.data ?? []) as unknown as MemberBadgeRow[])
      .filter(
        (r): r is MemberBadgeRow & { badges: BadgeRow } => r.badges !== null,
      )
      .map((r) => ({ ...r.badges, earned_at: r.earned_at }));

    available = (availableRes.data ?? []) as BadgeRow[];
  } catch (e) {
    console.warn("[mypage/badges] table missing — run migration 0003", e);
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-h3-lg font-semibold text-fg-1">뱃지</h2>
        <p className="mt-1 text-body text-fg-3">
          활동을 통해 자동으로 부여되는 뱃지를 확인하세요.
        </p>
      </header>

      <BadgeList earned={earned} available={available} />
    </div>
  );
}
