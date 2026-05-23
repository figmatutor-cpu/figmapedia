import Link from "next/link";

interface AiLabPromoCardProps {
  variant?: "default" | "compact";
}

export function AiLabPromoCard({ variant = "default" }: AiLabPromoCardProps) {
  const compact = variant === "compact";

  return (
    <section
      aria-label="AI 실험실 안내"
      className={`rounded-xl border border-brand-blue/30 bg-brand-blue/10 ${
        compact ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <span className="inline-block rounded-full border border-brand-blue/40 bg-brand-blue/15 px-3 py-1 text-xxs font-medium text-brand-blue-light">
        디자이너의 AI 실험실
      </span>
      <h3
        className={`mt-4 font-semibold text-white ${
          compact ? "text-lg" : "text-xl md:text-2xl"
        }`}
      >
        이 프롬프트로 직접 실험해보세요
      </h3>
      <p className="mt-3 text-sm leading-6 text-gray-300">
        프롬프트를 모으는 것에서 멈추지 마세요. 매주 새로운 AI 도구를 함께
        실험하고, 결과를 공유하고, 라이브로 발표하는 커뮤니티가 기다리고
        있습니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/ai-lab"
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
        >
          AI 실험실 보기 →
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
