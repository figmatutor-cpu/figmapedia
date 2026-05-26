import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ReportFooterProps {
  prev: ExperimentMeta | null;
  next: ExperimentMeta | null;
}

export function ReportFooter({ prev, next }: ReportFooterProps) {
  return (
    <section className="mt-12 rounded-xl border border-border-1 bg-glass-1 p-6">
      <p className="text-body font-semibold text-fg-1">
        이 리포트가 도움이 되셨나요?
      </p>
      <p className="mt-1 text-meta text-fg-3">
        매주 새로운 실험 리포트를 발행합니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {next && (
          <Link
            href={`/ai-lab/${next.slug}`}
            className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
          >
            다음 리포트 →
          </Link>
        )}
        {prev && (
          <Link
            href={`/ai-lab/${prev.slug}`}
            className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
          >
            ← 이전 리포트
          </Link>
        )}
        <Link
          href="/ai-lab"
          className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
        >
          AI 실험실로
        </Link>
      </div>
    </section>
  );
}
