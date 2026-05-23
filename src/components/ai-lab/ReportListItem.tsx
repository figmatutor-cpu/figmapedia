import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ReportListItemProps {
  experiment: ExperimentMeta;
}

export function ReportListItem({ experiment }: ReportListItemProps) {
  const { slug, title, summary, publishedAt } = experiment;

  return (
    <Link
      href={`/ai-lab/${slug}`}
      className="group block rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full border border-border-1 bg-glass-1 px-2.5 py-1 text-xxs font-medium text-gray-300">
            리포트
          </span>
          <h3 className="mt-3 line-clamp-1 text-base font-semibold text-white">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-400">{summary}</p>
        </div>
        <time
          className="flex-shrink-0 text-xs text-gray-500"
          dateTime={publishedAt}
        >
          {publishedAt}
        </time>
      </div>
    </Link>
  );
}
