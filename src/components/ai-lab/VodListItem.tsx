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
      className="group block rounded-xl border border-border-1 bg-glass-1 p-5 transition hover:border-border-2 hover:bg-glass-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full border border-border-1 bg-glass-1 px-2.5 py-1 text-xxs font-medium text-fg-2">
            VOD · 멤버 전용
          </span>
          <h3 className="mt-3 line-clamp-2 text-body-lg font-semibold text-fg-1">
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-fg-4">
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
