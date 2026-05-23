import Link from "next/link";

export function ReportPaywall() {
  return (
    <section className="mt-8 rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-6 md:p-8">
      <h2 className="text-base font-semibold text-white md:text-lg">
        멤버 전용 콘텐츠
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-300">
        전체 실험 본문과 결과는 멤버에게만 공개됩니다. 지금 가입하고 모든
        리포트를 제한 없이 열람하세요.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/membership"
          className="rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
        >
          멤버십 알아보기
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}
