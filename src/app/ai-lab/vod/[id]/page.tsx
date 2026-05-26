import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YouTubeEmbed } from "@/components/ai-lab/YouTubeEmbed";
import { getVodById } from "@/lib/supabase/vods";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}시간 ${m % 60}분`;
  return `${m}분`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vod = await getVodById(id);
  if (!vod) return { title: "VOD | AI 실험실" };

  return {
    title: `${vod.title} | 다시보기 | AI 실험실`,
    robots: { index: false, follow: false },
  };
}

export default async function VodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vod = await getVodById(id);
  if (!vod) notFound();

  const duration = formatDuration(vod.duration_seconds);

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-5xl px-6 py-10 md:py-14">
        <nav className="mb-6 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/ai-lab" className="transition hover:text-fg-2">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <Link href="/ai-lab/live" className="transition hover:text-fg-2">
            라이브 세션
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">다시보기</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-h2 font-semibold leading-snug text-fg-1 md:text-h1">
            {vod.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-fg-4">
            <time dateTime={vod.recorded_at}>{vod.recorded_at}</time>
            {duration && (
              <>
                <span aria-hidden>·</span>
                <span>{duration}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="text-brand-blue-light">멤버 전용</span>
          </div>
        </header>

        <YouTubeEmbed videoId={vod.youtube_id} title={vod.title} />

        <section className="mt-10 rounded-xl border border-border-1 bg-glass-1 p-6">
          <h2 className="text-body font-semibold text-fg-1">
            시청해 주셔서 감사합니다
          </h2>
          <p className="mt-2 text-meta leading-6 text-fg-3">
            실시간 라이브는 매주 일요일 저녁 YouTube Live로 진행됩니다. 더 많은
            실험 콘텐츠는 AI 실험실에서 확인하세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/ai-lab/live"
              className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
            >
              라이브 세션 보기
            </Link>
            <Link
              href="/ai-lab"
              className="rounded-full border border-border-1 bg-glass-1 px-4 py-2 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
            >
              AI 실험실
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
