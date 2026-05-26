"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/ai-lab";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createSupabaseBrowserClient();

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setErrorMessage("");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  async function signInWithGoogle() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-border-1 bg-glass-1 p-8 backdrop-blur-md">
        <h1 className="text-h2 font-semibold text-fg-1">
          디자이너의 AI 실험실
        </h1>
        <p className="mt-2 text-body text-fg-3">
          로그인하고 실험에 참여해보세요
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-inverse px-4 py-3 text-body font-medium text-fg-inverse transition hover:bg-surface-inverse"
        >
          <GoogleIcon className="h-4 w-4" />
          Google로 시작
        </button>

        <div className="my-6 flex items-center gap-3 text-meta text-fg-4">
          <div className="h-px flex-1 bg-glass-3" />
          또는
          <div className="h-px flex-1 bg-glass-3" />
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <label className="block">
            <span className="text-meta text-fg-3">이메일</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-border-1 bg-glass-1 px-4 py-3 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-2 focus:bg-glass-1 focus:outline-none"
              disabled={status === "sending" || status === "sent"}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="w-full rounded-lg border border-border-1 bg-glass-3 px-4 py-3 text-body font-medium text-fg-1 transition hover:border-border-2 hover:bg-glass-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending"
              ? "전송 중..."
              : status === "sent"
                ? "이메일을 확인하세요"
                : "이메일로 로그인 링크 받기"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-4 rounded-lg border border-border-1 bg-glass-1 p-3 text-meta text-fg-2">
            {email}로 로그인 링크를 보냈습니다. 메일함을 확인해주세요.
          </p>
        )}

        {status === "error" && errorMessage && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-status-danger/10 p-3 text-meta text-red-300">
            {errorMessage}
          </p>
        )}

        <p className="mt-8 text-meta text-fg-4">
          로그인하면{" "}
          <a href="/terms" className="underline hover:text-fg-2">
            이용약관
          </a>
          {" 및 "}
          <a href="/privacy" className="underline hover:text-fg-2">
            개인정보처리방침
          </a>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.614Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <LoginForm />
    </Suspense>
  );
}
