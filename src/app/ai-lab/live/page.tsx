import Link from "next/link";
import { NextLiveCard } from "@/components/ai-lab/NextLiveCard";
import { VodListItem } from "@/components/ai-lab/VodListItem";
import { getPublishedVods } from "@/lib/supabase/vods";

export const revalidate = 300;

export default async function LivePage() {
  const vods = await getPublishedVods(20);

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/ai-lab" className="transition hover:text-gray-300">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <span className="text-gray-400">라이브 세션</span>
        </nav>

        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            라이브 세션
          </h1>
          <p className="mt-3 text-sm text-gray-400 md:text-base">
            매주 일요일 저녁, YouTube Live로 진행됩니다. 라이브는 누구나 무료로
            시청할 수 있고, 다시보기는 멤버 전용입니다.
          </p>
        </header>

        <section className="mt-10">
          <NextLiveCard />
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">다시보기 (VOD)</h2>
            <span className="text-xxs text-gray-500">멤버 전용</span>
          </div>

          {vods.length > 0 ? (
            <div className="space-y-3">
              {vods.map((vod) => (
                <VodListItem key={vod.id} vod={vod} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-gray-400">다시보기가 곧 추가됩니다</p>
              <p className="mt-2 text-xs text-gray-500">
                첫 라이브 종료 후 멤버 전용 VOD로 공개됩니다
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
