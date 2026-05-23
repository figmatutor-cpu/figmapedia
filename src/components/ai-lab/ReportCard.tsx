import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ReportCardProps {
  experiment: ExperimentMeta;
}

export function ReportCard({ experiment }: ReportCardProps) {
  const { slug, title, tool, tags, summary, publishedAt } = experiment;

  return (
    <Link
      href={`/ai-lab/${slug}`}
      className="group block rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
    >
      <div className="flex items-center justify-between text-xxs text-gray-500">
        <span className="rounded-full border border-border-1 bg-glass-1 px-2.5 py-1 font-medium text-gray-300">
          {tool}
        </span>
        <time dateTime={publishedAt}>{publishedAt}</time>
      </div>

      <h3 className="mt-4 line-clamp-2 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm text-gray-400">{summary}</p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-1 bg-glass-1 px-2.5 py-0.5 text-xxs text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
