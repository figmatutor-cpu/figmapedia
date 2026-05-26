import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface Props {
  experiment: ExperimentMeta;
}

export function ArchiveCard({ experiment }: Props) {
  const { slug, title, summary, tool, tags, publishedAt, coverImage, week } =
    experiment;

  return (
    <Link
      href={`/ai-lab/${slug}`}
      className="group flex gap-4 rounded-xl border border-border-1 bg-glass-2 p-4 transition hover:border-border-2 hover:bg-glass-3 md:gap-5 md:p-5"
    >
      <div className="hidden h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-border-1 bg-glass-1 md:flex md:items-center md:justify-center">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xxs text-fg-5">no image</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xxs text-fg-4">
          <span className="rounded-full border border-border-1 bg-glass-1 px-2.5 py-0.5 text-fg-3">
            {tool}
          </span>
          <span>{publishedAt}</span>
          {week && (
            <>
              <span aria-hidden>·</span>
              <span>{week} 주차</span>
            </>
          )}
        </div>

        <h3 className="mt-2 line-clamp-1 text-h3 font-semibold text-fg-1">
          {title}
        </h3>

        <p className="mt-1 line-clamp-2 text-meta text-fg-3 md:text-body">
          {summary}
        </p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-1 bg-glass-1 px-2 py-0.5 text-xxs text-fg-3"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
