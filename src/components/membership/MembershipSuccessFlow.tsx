"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Props {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  planType?: "monthly" | "annual";
}

type FlowState =
  | { kind: "missing" }
  | { kind: "confirming" }
  | {
      kind: "done";
      planType: "monthly" | "annual";
      receiptUrl?: string | null;
    }
  | { kind: "error"; message: string };

export function MembershipSuccessFlow({
  paymentKey,
  orderId,
  amount,
  planType,
}: Props) {
  const initial: FlowState =
    paymentKey && orderId && amount && planType
      ? { kind: "confirming" }
      : { kind: "missing" };
  const [state, setState] = useState<FlowState>(initial);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (state.kind !== "confirming" || confirmedRef.current) return;
    confirmedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount, planType }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          planType?: "monthly" | "annual";
          receipt_url?: string | null;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        const supabase = createSupabaseBrowserClient();
        await supabase.auth.refreshSession();

        setState({
          kind: "done",
          planType: data.planType ?? (planType as "monthly" | "annual"),
          receiptUrl: data.receipt_url ?? null,
        });
      } catch (e) {
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
  }, [state.kind, paymentKey, orderId, amount, planType]);

  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  if (state.kind === "missing") {
    return (
      <div className="rounded-xl border border-border-1 bg-glass-2 p-8">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          결제 정보를 확인할 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          결제 진행 중 문제가 있었을 수 있습니다. 결제 후 자동으로 이 페이지로
          이동하지 않은 경우 멤버십 페이지에서 다시 시도해주세요.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/membership"
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
          >
            멤버십 페이지로
          </Link>
          <Link
            href="/ai-lab"
            className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-3"
          >
            AI 실험실
          </Link>
        </div>
      </div>
    );
  }

  if (state.kind === "confirming") {
    return (
      <div className="rounded-xl border border-border-1 bg-glass-2 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          결제를 확인하고 있어요
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          잠시만 기다려주세요. 결제 승인과 멤버십 활성화를 처리 중입니다.
        </p>
        <div className="mt-6 inline-block h-1 w-32 overflow-hidden rounded-full bg-glass-1">
          <div className="h-full w-1/2 animate-pulse bg-brand-blue" />
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          결제 확인에 실패했습니다
        </h1>
        <p className="mt-3 text-sm text-red-200">{state.message}</p>
        <p className="mt-2 text-xs text-red-300/80">
          결제는 토스 측에서 정상 처리되었더라도 우리 시스템에 반영이 되지 않은
          상태일 수 있습니다. yiseo@figmatutor.info로 주문 번호({orderId})를
          알려주시면 빠르게 확인해 드립니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={`mailto:yiseo@figmatutor.info?subject=결제%20문의&body=주문번호: ${orderId}`}
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
          >
            문의하기
          </a>
          <Link
            href="/membership"
            className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-3"
          >
            멤버십 페이지로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8">
        <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xxs font-medium text-emerald-300">
          멤버십 활성화 완료
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
          환영합니다!
        </h1>
        <p className="mt-3 text-sm leading-7 text-gray-300">
          {state.planType === "annual" ? "연간" : "월간"} 멤버십이
          활성화되었습니다. 이제 실험 리포트 전체 본문, 라이브 다시보기,
          오프라인 스터디 공간을 모두 이용할 수 있습니다.
        </p>
        {state.receiptUrl && (
          <a
            href={state.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs text-emerald-300 underline hover:text-emerald-200"
          >
            영수증 보기 →
          </a>
        )}
      </div>

      <section className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <h2 className="text-base font-semibold text-white">
          다음 단계 — Discord 커뮤니티 입장
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          주간 실험 투표, 결과 공유, 라이브 알림 모두 Discord에서 진행됩니다.
          멤버 채널에 입장해 다른 멤버들과 인사를 나눠보세요.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-gray-300">
          <li>
            <span className="mr-2 text-gray-500">1.</span>아래 버튼으로 Discord
            서버 입장
          </li>
          <li>
            <span className="mr-2 text-gray-500">2.</span>#역할-인증 채널에서
            가입 이메일을 입력
          </li>
          <li>
            <span className="mr-2 text-gray-500">3.</span>봇이 자동으로 멤버
            역할을 부여합니다
          </li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
          >
            Discord 서버 입장하기
          </a>
          <Link
            href="/ai-lab"
            className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-3"
          >
            AI 실험실로 이동
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-border-1 bg-glass-1 p-6 text-xs leading-6 text-gray-400">
        <p className="font-medium text-gray-300">멤버 혜택 다시보기</p>
        <ul className="mt-2 space-y-1">
          <li>· 실험 리포트 전체 본문 (`/ai-lab/[slug]`)</li>
          <li>· 라이브 다시보기 VOD (`/ai-lab/live`)</li>
          <li>· 오프라인 스터디 공간 예약 (`/study-room`)</li>
          <li>· 주제 투표 참여 (`/ai-lab/vote`)</li>
        </ul>
      </section>
    </div>
  );
}
