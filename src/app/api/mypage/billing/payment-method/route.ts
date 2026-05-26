import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 결제 수단 변경 트리거 — Phase 2 W2 stub.
 *
 * 토스 가맹 승인 후 구현 (docs/TOSS_SETUP.md 참조):
 *   1. 기존 빌링키 폐기 요청
 *   2. 새 빌링키 발급용 위젯 URL 반환
 *   3. 클라이언트가 위젯 호출 → 성공 시 webhook으로 members.toss_billing_key 갱신
 */
export async function PATCH() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tossConfigured = Boolean(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && process.env.TOSS_SECRET_KEY,
  );

  if (!tossConfigured) {
    return NextResponse.json({
      ok: true,
      widget_url: null,
      message:
        "결제 수단 변경 요청이 접수되었습니다. 토스 가맹 승인 후 위젯에서 진행할 수 있습니다.",
    });
  }

  return NextResponse.json({
    ok: true,
    widget_url: null,
    message:
      "결제 수단 변경 위젯이 아직 통합되지 않았습니다. 운영자에게 문의해주세요.",
  });
}
