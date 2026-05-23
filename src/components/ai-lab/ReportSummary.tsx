import type { ExperimentMeta } from "@/types/experiment";

interface ReportSummaryProps {
  experiment: ExperimentMeta;
}

export function ReportSummary({ experiment }: ReportSummaryProps) {
  const { keyMetrics, summary } = experiment;

  return (
    <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-sm font-semibold text-white">리포트 요약</h2>

      {keyMetrics && keyMetrics.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {keyMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className="mt-1 text-lg font-semibold text-white md:text-xl">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 whitespace-pre-line text-sm leading-7 text-gray-300 md:text-base">
        {summary}
      </p>
    </section>
  );
}
