import type { ExperimentMeta } from "@/types/experiment";

interface ReportMetaProps {
  experiment: ExperimentMeta;
}

export function ReportMeta({ experiment }: ReportMetaProps) {
  const { title, tags, publishedAt, author, tool } = experiment;

  return (
    <header>
      <h1 className="text-h2 font-semibold leading-snug text-fg-1 md:text-h1">
        {title}
      </h1>

      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-1 bg-glass-1 px-3 py-1 text-meta text-fg-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-fg-4">
        <span>{tool}</span>
        <span aria-hidden>·</span>
        <time dateTime={publishedAt}>{publishedAt}</time>
        {author && (
          <>
            <span aria-hidden>·</span>
            <span>{author}</span>
          </>
        )}
      </div>
    </header>
  );
}
