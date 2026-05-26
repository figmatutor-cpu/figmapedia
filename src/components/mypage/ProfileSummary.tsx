import type { User } from "@supabase/supabase-js";
import type { MemberRole } from "@/types/member";

interface MemberProfile {
  role: MemberRole;
  plan_type: "monthly" | "annual" | null;
  subscription_status: string | null;
  subscribed_at: string | null;
  next_billing_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface Props {
  user: User;
  member: MemberProfile;
}

const ROLE_LABEL: Record<MemberRole, string> = {
  free: "무료 회원",
  member: "유료 멤버",
  admin: "운영자",
};

const ROLE_BADGE: Record<MemberRole, string> = {
  free: "border-border-1 bg-glass-1 text-fg-3",
  member: "border-brand-blue/40 bg-brand-blue/15 text-brand-blue-light",
  admin: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
};

function fmt(v: string | null | undefined): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("ko-KR");
}

export function ProfileSummary({ user, member }: Props) {
  const renewLabel = member.plan_type === "annual" ? "만료일" : "다음 결제일";
  const renewDate =
    member.plan_type === "annual" ? member.expires_at : member.next_billing_at;

  return (
    <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xxs ${ROLE_BADGE[member.role]}`}
            >
              {ROLE_LABEL[member.role]}
            </span>
            {member.plan_type && (
              <span className="rounded-full border border-border-1 bg-glass-1 px-2.5 py-1 text-xxs text-fg-2">
                {member.plan_type === "annual" ? "연간" : "월간"}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-h3 font-semibold text-fg-1 md:text-h3-lg">
            {user.email ?? "(이메일 없음)"}
          </h2>
          <p className="mt-1 text-meta text-fg-4">
            {fmt(member.created_at)} 가입
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-meta md:text-body">
          <dt className="text-fg-4">구독 상태</dt>
          <dd className="text-fg-2">
            {member.subscription_status ?? "구독 안 함"}
          </dd>
          <dt className="text-fg-4">구독 시작</dt>
          <dd className="text-fg-2">{fmt(member.subscribed_at)}</dd>
          <dt className="text-fg-4">{renewLabel}</dt>
          <dd className="text-fg-2">{fmt(renewDate)}</dd>
        </dl>
      </div>
    </section>
  );
}
