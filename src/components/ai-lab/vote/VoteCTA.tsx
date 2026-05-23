import Link from "next/link";

interface VoteCTAProps {
  variant: "login" | "closed";
  nextPath?: string;
}

export function VoteCTA({ variant, nextPath = "/ai-lab/vote" }: VoteCTAProps) {
  if (variant === "closed") {
    return (
      <section className="rounded-xl border border-border-1 bg-glass-1 p-6 text-center">
        <p className="text-sm text-gray-300">이번 주 투표는 마감되었습니다</p>
        <p className="mt-1 text-xs text-gray-500">
          다음 주 주제 투표는 곧 다시 시작됩니다
        </p>
      </section>
    );
  }

  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <section className="rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-6">
      <h3 className="text-base font-semibold text-white">
        로그인 후 투표에 참여하세요
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-300">
        무료 회원도 매주 실험 주제 투표에 참여할 수 있습니다. 결과는 누구나 볼
        수 있지만, 직접 표를 던지려면 로그인해주세요.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={loginHref}
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
        >
          로그인하고 투표하기 →
        </Link>
        <Link
          href="/membership"
          className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-border-2 hover:bg-glass-2"
        >
          멤버십 알아보기
        </Link>
      </div>
    </section>
  );
}
