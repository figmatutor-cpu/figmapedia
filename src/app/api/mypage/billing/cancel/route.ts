import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // body 없어도 허용
  }
  const { reason, detail } = (body ?? {}) as Record<string, unknown>;

  const { data: member, error: fetchError } = await supabase
    .from("members")
    .select("plan_type, subscription_status, expires_at, next_billing_at")
    .eq("id", user.id)
    .maybeSingle();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!member?.plan_type) {
    return NextResponse.json(
      { error: "활성 구독이 없습니다" },
      { status: 400 },
    );
  }

  const cancelMetadata: Record<string, unknown> = {
    reason: typeof reason === "string" ? reason : null,
    detail: typeof detail === "string" ? detail.slice(0, 500) : null,
    cancelled_via: "self_service",
  };

  const { error: updateError } = await supabase
    .from("members")
    .update({
      subscription_status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log("[mypage/billing/cancel]", {
    user_id: user.id,
    ...cancelMetadata,
  });

  return NextResponse.json({
    ok: true,
    expires_at: member.expires_at,
    next_billing_at: member.next_billing_at,
    note: "현재 회차 만료까지 혜택이 유지됩니다. 실제 결제 취소는 토스 가맹 승인 후 자동 처리됩니다.",
  });
}
