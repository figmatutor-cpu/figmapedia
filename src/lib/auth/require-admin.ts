import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readRoleFromJwt } from "@/types/member";

type RequireAdminOptions = {
  next?: string;
};

/**
 * Server Component / Route Handler 가드.
 * 미인증 → /auth/login, role !== 'admin' → / 로 리다이렉트.
 */
export async function requireAdmin(options: RequireAdminOptions = {}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = options.next
      ? `?next=${encodeURIComponent(options.next)}`
      : "";
    redirect(`/auth/login${next}`);
  }

  const role = readRoleFromJwt(user.app_metadata);
  if (role !== "admin") {
    redirect("/");
  }

  return { supabase, user };
}

/**
 * API 라우트용. redirect 대신 { ok, error } 반환.
 */
export async function requireAdminApi() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      error: { status: 401, message: "Unauthorized" },
    };
  }

  const role = readRoleFromJwt(user.app_metadata);
  if (role !== "admin") {
    return {
      ok: false as const,
      error: { status: 403, message: "Admin only" },
    };
  }

  return { ok: true as const, supabase, user };
}
