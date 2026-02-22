export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-16 rounded bg-white/10" />
              <div className="h-5 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
