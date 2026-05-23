import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPaidRole, readRoleFromJwt, type MemberRole } from "@/types/member";

type RequireAuthOptions = {
  next?: string;
};

export async function requireAuth(options: RequireAuthOptions = {}) {
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

  return { supabase, user };
}

export async function requireMember(options: RequireAuthOptions = {}) {
  const { supabase, user } = await requireAuth(options);
  const role = readRoleFromJwt(user.app_metadata);

  if (!isPaidRole(role)) {
    redirect("/membership?reason=member_only");
  }

  return { supabase, user, role: role as MemberRole };
}
