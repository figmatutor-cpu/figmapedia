import Link from "next/link";
import type { VodMeta } from "@/lib/supabase/vods";

interface VodListItemProps {
  vod: VodMeta;
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}시간 ${m % 60}분`;
  return `${m}분`;
}

export function VodListItem({ vod }: VodListItemProps) {
  const { id, title, recorded_at, duration_seconds } = vod;
  const duration = formatDuration(duration_seconds);

  return (
    <Link
      href={`/ai-lab/vod/${id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xxs font-medium text-gray-300">
            VOD · 멤버 전용
          </span>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold text-white">
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <time dateTime={recorded_at}>{recorded_at}</time>
            {duration && (
              <>
                <span aria-hidden>·</span>
                <span>{duration}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
