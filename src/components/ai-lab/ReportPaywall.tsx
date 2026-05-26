import Link from "next/link";

export function ReportPaywall() {
  return (
    <section className="mt-8 rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-6 md:p-8">
      <h2 className="text-body-lg font-semibold text-fg-1 md:text-h3">
        멤버 전용 콘텐츠
      </h2>
      <p className="mt-3 text-body leading-6 text-fg-2">
        전체 실험 본문과 결과는 멤버에게만 공개됩니다. 지금 가입하고 모든
        리포트를 제한 없이 열람하세요.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/membership"
          className="rounded-full bg-brand-blue px-6 py-3 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent"
        >
          멤버십 알아보기
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-border-1 bg-glass-1 px-6 py-3 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}
