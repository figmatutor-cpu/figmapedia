import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ThisWeekHeroProps {
  experiment: ExperimentMeta;
}

export function ThisWeekHero({ experiment }: ThisWeekHeroProps) {
  const { slug, title, summary, coverImage } = experiment;

  return (
    <div className="rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-8">
        <div>
          <span className="inline-block rounded-full border border-brand-blue/40 bg-brand-blue/15 px-3 py-1 text-xxs font-medium text-brand-blue-light">
            이번 주 주제
          </span>
          <h2 className="mt-4 text-h3-lg font-semibold text-fg-1 md:text-h2">
            {title}
          </h2>
          <p className="mt-3 line-clamp-4 whitespace-pre-line text-body text-fg-3 md:text-body-lg">
            {summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/ai-lab/${slug}`}
              className="rounded-full bg-brand-blue px-5 py-2.5 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent"
            >
              실험 참여하기
            </Link>
            <Link
              href="#past-experiments"
              className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
            >
              지난 주제 보기
            </Link>
          </div>
        </div>

        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border-1 bg-glass-1 md:h-auto md:min-h-40">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-meta text-fg-4">
              이번 주 주제 커버 이미지
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
