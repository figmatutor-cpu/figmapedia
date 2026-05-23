import Link from "next/link";
import type { ExperimentMeta } from "@/types/experiment";

interface ThisWeekHeroProps {
  experiment: ExperimentMeta;
}

export function ThisWeekHero({ experiment }: ThisWeekHeroProps) {
  const { slug, title, summary, coverImage } = experiment;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-8">
        <div>
          <span className="inline-block rounded-full border border-brand-blue/40 bg-brand-blue/15 px-3 py-1 text-xxs font-medium text-brand-blue-light">
            이번 주 주제
          </span>
          <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">
            {title}
          </h2>
          <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm text-gray-400 md:text-base">
            {summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/ai-lab/${slug}`}
              className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
            >
              실험 참여하기
            </Link>
            <Link
              href="#past-experiments"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              지난 주제 보기
            </Link>
          </div>
        </div>

        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] md:h-auto md:min-h-40">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500">
              이번 주 주제 커버 이미지
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
