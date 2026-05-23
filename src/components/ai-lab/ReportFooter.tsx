import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ReportFooterProps {
  prev: ExperimentMeta | null;
  next: ExperimentMeta | null;
}

export function ReportFooter({ prev, next }: ReportFooterProps) {
  return (
    <section className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm font-semibold text-white">
        이 리포트가 도움이 되셨나요?
      </p>
      <p className="mt-1 text-xs text-gray-400">
        매주 새로운 실험 리포트를 발행합니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {next && (
          <Link
            href={`/ai-lab/${next.slug}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            다음 리포트 →
          </Link>
        )}
        {prev && (
          <Link
            href={`/ai-lab/${prev.slug}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            ← 이전 리포트
          </Link>
        )}
        <Link
          href="/ai-lab"
          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          AI 실험실로
        </Link>
      </div>
    </section>
  );
}
