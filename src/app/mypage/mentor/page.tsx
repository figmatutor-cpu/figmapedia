import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMyIncomingBookings,
  getMyMentorPayouts,
  getMyMentorSessions,
} from "@/lib/supabase/mentors";
import { SESSION_TYPE_LABEL } from "@/types/mentor";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "결제 대기",
  paid: "결제 완료",
  completed: "세션 완료",
  cancelled: "취소",
  no_show: "노쇼",
  refunded: "환불",
};

function fmtKRW(v: number): string {
  return `₩${v.toLocaleString("ko-KR")}`;
}

function fmtMonth(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function fmtDate(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("ko-KR");
}

export default async function MentorDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent("/mypage/mentor")}`);
  }

  // 본인이 active 멘토인지 확인 — members 본인 row 는 RLS 통과 (Users can view their own member row)
  const { data: me } = await supabase
    .from("members")
    .select("mentor_status, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!me || me.mentor_status !== "active") {
    return (
      <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-10 text-center">
        <h2 className="text-h3 font-semibold text-fg-1">멘토 전용 대시보드</h2>
        <p className="mt-3 text-meta text-fg-3">
          현재 계정은 멘토로 활성화되어 있지 않습니다. 멘토 신청은 운영자에게
          문의해 주세요.
        </p>
        <Link
          href="/mentors"
          className="mt-6 inline-block rounded-full border border-border-1 bg-glass-2 px-5 py-2 text-meta text-fg-2 transition hover:border-border-2 hover:bg-glass-3"
        >
          멘토 목록 보기
        </Link>
      </div>
    );
  }

  const [payouts, sessions, bookings] = await Promise.all([
    getMyMentorPayouts(),
    getMyMentorSessions(user.id),
    getMyIncomingBookings(user.id),
  ]);

  const lifetimePayout = payouts.reduce(
    (sum, p) => sum + p.mentor_payout_total,
    0,
  );
  const lifetimeFee = payouts.reduce((sum, p) => sum + p.platform_fee_total, 0);
  const lifetimeGross = payouts.reduce((sum, p) => sum + p.gross_amount, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">
          {me.display_name ?? "멘토"} 님의 정산 합산
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border-1 bg-glass-1 p-4">
            <p className="text-xxs uppercase tracking-widest text-fg-4">
              총 매출
            </p>
            <p className="mt-1 text-h2 font-semibold text-fg-1">
              {fmtKRW(lifetimeGross)}
            </p>
          </div>
          <div className="rounded-lg border border-border-1 bg-glass-1 p-4">
            <p className="text-xxs uppercase tracking-widest text-fg-4">
              플랫폼 수수료
            </p>
            <p className="mt-1 text-h2 font-semibold text-fg-3">
              −{fmtKRW(lifetimeFee)}
            </p>
          </div>
          <div className="rounded-lg border border-brand-blue/40 bg-brand-blue/10 p-4">
            <p className="text-xxs uppercase tracking-widest text-brand-blue-light">
              내 정산 합계
            </p>
            <p className="mt-1 text-h2 font-semibold text-fg-1">
              {fmtKRW(lifetimePayout)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">월별 정산</h2>
        {payouts.length === 0 ? (
          <p className="mt-4 text-meta text-fg-4">
            아직 결제된 세션이 없습니다. 위너 주제로 선정되거나 직접 세션을
            오픈하면 정산 내역이 표시됩니다.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-md border-collapse text-meta">
              <thead>
                <tr className="border-b border-border-1 text-left text-fg-4">
                  <th className="py-2 font-normal">월</th>
                  <th className="py-2 font-normal">결제 건수</th>
                  <th className="py-2 text-right font-normal">매출</th>
                  <th className="py-2 text-right font-normal">수수료</th>
                  <th className="py-2 text-right font-normal">정산 금액</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr
                    key={p.month}
                    className="border-b border-border-1 last:border-0"
                  >
                    <td className="py-3 text-fg-2">{fmtMonth(p.month)}</td>
                    <td className="py-3 text-fg-3">{p.paid_count}건</td>
                    <td className="py-3 text-right text-fg-2">
                      {fmtKRW(p.gross_amount)}
                    </td>
                    <td className="py-3 text-right text-fg-4">
                      −{fmtKRW(p.platform_fee_total)}
                    </td>
                    <td className="py-3 text-right font-semibold text-fg-1">
                      {fmtKRW(p.mentor_payout_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xxs text-fg-5">
          매월 말일 기준으로 운영자가 등록된 계좌로 송금합니다. 정산 송금 내역은
          별도 안내로 제공됩니다.
        </p>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">내 세션</h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-meta text-fg-4">
            등록된 세션이 없습니다. 위너로 선정되면 자동으로 세션이 생성됩니다.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border-1 bg-glass-1 p-3 text-meta"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-fg-1">{s.title}</p>
                  <p className="mt-0.5 text-xxs text-fg-4">
                    {SESSION_TYPE_LABEL[s.type]} · 정원 {s.max_participants}명 ·{" "}
                    {fmtKRW(s.price)}
                  </p>
                </div>
                <span className="ml-3 rounded-full border border-border-1 bg-glass-2 px-2.5 py-0.5 text-xxs text-fg-3">
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-body-lg font-semibold text-fg-1">최근 예약</h2>
        {bookings.length === 0 ? (
          <p className="mt-4 text-meta text-fg-4">
            아직 예약이 들어오지 않았습니다.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-border-1 bg-glass-1 p-3 text-meta"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-fg-2">
                    {STATUS_LABEL[b.status] ?? b.status} ·{" "}
                    {fmtKRW(b.mentor_payout_amount)} 정산
                  </p>
                  <p className="mt-0.5 text-xxs text-fg-4">
                    {fmtDate(b.created_at)} ·{" "}
                    {b.scheduled_at
                      ? `일정 ${fmtDate(b.scheduled_at)}`
                      : "일정 미정"}
                  </p>
                </div>
                <span className="ml-3 text-xxs text-fg-4">
                  매출 {fmtKRW(b.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
