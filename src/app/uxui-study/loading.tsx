import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-white/10 mb-2" />
          <div className="h-5 w-80 rounded bg-white/5 mb-6" />
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-white/5" />
            ))}
          </div>
        </div>
        <Skeleton count={6} />
      </div>
    </div>
  );
}
