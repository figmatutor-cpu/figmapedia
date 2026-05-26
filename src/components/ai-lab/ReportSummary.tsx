import type { ExperimentMeta } from "@/types/experiment";

interface ReportSummaryProps {
  experiment: ExperimentMeta;
}

export function ReportSummary({ experiment }: ReportSummaryProps) {
  const { keyMetrics, summary } = experiment;

  return (
    <section className="mt-10 rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
      <h2 className="text-body font-semibold text-fg-1">리포트 요약</h2>

      {keyMetrics && keyMetrics.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {keyMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-border-1 bg-glass-1 p-4"
            >
              <div className="text-meta text-fg-4">{m.label}</div>
              <div className="mt-1 text-h3 font-semibold text-fg-1 md:text-h3-lg">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 whitespace-pre-line text-body leading-7 text-fg-2 md:text-body-lg">
        {summary}
      </p>
    </section>
  );
}
