"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPaidRole, readRoleFromJwt, type MemberRole } from "@/types/member";

type UseMemberResult = {
  user: User | null;
  session: Session | null;
  role: MemberRole;
  isMember: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

export function useMember(): UseMemberResult {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const role = readRoleFromJwt(session?.user?.app_metadata);

  return {
    user: session?.user ?? null,
    session,
    role,
    isMember: isPaidRole(role),
    isLoading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
