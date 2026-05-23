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
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/ai-lab" className="transition hover:text-gray-300">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <Link href="/ai-lab/live" className="transition hover:text-gray-300">
            라이브 세션
          </Link>
          <span aria-hidden>›</span>
          <span className="text-gray-400">다시보기</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold leading-snug text-white md:text-3xl">
            {vod.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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

        <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white">
            시청해 주셔서 감사합니다
          </h2>
          <p className="mt-2 text-xs leading-6 text-gray-400">
            실시간 라이브는 매주 일요일 저녁 YouTube Live로 진행됩니다. 더 많은
            실험 콘텐츠는 AI 실험실에서 확인하세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/ai-lab/live"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              라이브 세션 보기
            </Link>
            <Link
              href="/ai-lab"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              AI 실험실
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
