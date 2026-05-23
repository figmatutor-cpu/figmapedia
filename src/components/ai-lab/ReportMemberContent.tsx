"use client";

import { useEffect, useState } from "react";
import { useMember } from "@/lib/auth/use-member";
import { ReportBody } from "./ReportBody";
import { ReportPaywall } from "./ReportPaywall";

interface ReportMemberContentProps {
  slug: string;
}

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; body: string }
  | { status: "error"; message: string };

export function ReportMemberContent({ slug }: ReportMemberContentProps) {
  const { isMember, isLoading: isAuthLoading } = useMember();
  const [state, setState] = useState<FetchState>({ status: "idle" });

  useEffect(() => {
    if (isAuthLoading || !isMember) return;
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/experiments/${encodeURIComponent(slug)}/full`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { body: string }) => {
        if (cancelled) return;
        setState({ status: "loaded", body: data.body });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isMember, slug]);

  if (isAuthLoading) {
    return (
      <section className="mt-8 rounded-xl border border-border-1 bg-glass-1 p-8 text-center">
        <p className="text-xs text-gray-500">불러오는 중...</p>
      </section>
    );
  }

  if (!isMember) return <ReportPaywall />;

  if (state.status === "loading" || state.status === "idle") {
    return (
      <section className="mt-8 rounded-xl border border-border-1 bg-glass-1 p-8 text-center">
        <p className="text-xs text-gray-500">본문을 불러오는 중...</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-300">
          콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <p className="mt-1 text-xs text-red-300/70">{state.message}</p>
      </section>
    );
  }

  return <ReportBody body={state.body} />;
}
