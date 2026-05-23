import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { supabase as adminDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Metric {
  label: string;
  value: number | string;
  hint?: string;
}

async function fetchMetrics(): Promise<Metric[]> {
  const [
    { count: candidateCount },
    { count: winnerCount },
    { count: vodTotal },
    { count: vodHidden },
    { count: memberTotal },
    { count: paidMemberCount },
  ] = await Promise.all([
    adminDb
      .from("experiment_topics")
      .select("id", { count: "exact", head: true })
      .eq("status", "candidate"),
    adminDb
      .from("experiment_topics")
      .select("id", { count: "exact", head: true })
      .eq("status", "winner"),
    adminDb.from("vods").select("id", { count: "exact", head: true }),
    adminDb
      .from("vods")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    adminDb.from("members").select("id", { count: "exact", head: true }),
    adminDb
      .from("members")
      .select("id", { count: "exact", head: true })
      .in("role", ["member", "admin"]),
  ]);

  return [
    {
      label: "진행 중 후보 주제",
      value: candidateCount ?? 0,
      hint: "투표 진행 중",
    },
    {
      label: "선정된 주제 (winner)",
      value: winnerCount ?? 0,
      hint: "마감 후 1위",
    },
    { label: "총 VOD", value: vodTotal ?? 0 },
    { label: "미공개 VOD", value: vodHidden ?? 0, hint: "공개 토글 필요" },
    { label: "총 회원", value: memberTotal ?? 0 },
    { label: "유료 회원", value: paidMemberCount ?? 0, hint: "member / admin" },
  ];
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const metrics = await fetchMetrics();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold text-white">현황</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border-1 bg-glass-1 p-4"
            >
              <div className="text-xxs text-gray-500">{m.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {m.value}
              </div>
              {m.hint && (
                <div className="mt-1 text-xxs text-gray-500">{m.hint}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-white">빠른 작업</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
            href="/admin/topics"
            className="rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
          >
            <div className="text-base font-semibold text-white">
              이번 주 주제 등록
            </div>
            <p className="mt-2 text-sm text-gray-400">
              후보 3~4개를 등록하고 마감 시각을 설정하세요.
            </p>
          </Link>
          <Link
            href="/admin/vods"
            className="rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
          >
            <div className="text-base font-semibold text-white">VOD 등록</div>
            <p className="mt-2 text-sm text-gray-400">
              YouTube Unlisted 영상 ID를 등록하면 멤버에게 노출됩니다.
            </p>
          </Link>
          <Link
            href="/admin/members"
            className="rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
          >
            <div className="text-base font-semibold text-white">회원 관리</div>
            <p className="mt-2 text-sm text-gray-400">
              role 변경, 강제 해지, Discord 연동 정보 확인.
            </p>
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-1 p-5">
        <h3 className="text-sm font-semibold text-white">베타 운영 가이드</h3>
        <ul className="mt-3 space-y-1 text-xs leading-6 text-gray-400">
          <li>· 매주 월요일: 후보 주제 3~4개 등록 (마감을 화요일 18:00로)</li>
          <li>· 화요일 18:00 자동 마감 후 winner 자동 결정</li>
          <li>· 일요일: 라이브 후 VOD 등록 + 리포트 MDX 추가</li>
          <li>
            · role 변경 시 해당 멤버는 다음 페이지 이동에서 자동 재로그인 요구
          </li>
        </ul>
      </section>
    </div>
  );
}
