import type { TopicWithVotes } from "@/types/topic";

interface TopicCardProps {
  topic: TopicWithVotes;
  totalVotes: number;
  selected: boolean;
  disabled?: boolean;
  pending?: boolean;
  onSelect?: () => void;
  showStatusBadge?: boolean;
}

function statusLabel(status: TopicWithVotes["status"]): string {
  switch (status) {
    case "winner":
      return "선정";
    case "archived":
      return "마감";
    case "rejected":
      return "반려";
    default:
      return "";
  }
}

export function TopicCard({
  topic,
  totalVotes,
  selected,
  disabled,
  pending,
  onSelect,
  showStatusBadge,
}: TopicCardProps) {
  const pct = totalVotes > 0 ? Math.round((topic.votes / totalVotes) * 100) : 0;
  const isWinner = topic.status === "winner";

  const containerClass = [
    "group relative w-full rounded-xl border p-5 text-left transition",
    selected
      ? "border-brand-blue/60 bg-brand-blue/15"
      : isWinner
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-border-1 bg-glass-1 hover:border-border-2 hover:bg-glass-2",
    disabled ? "cursor-default" : "cursor-pointer",
    pending ? "opacity-60" : "",
  ].join(" ");

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={onSelect}
      className={containerClass}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition ${
            selected
              ? "border-brand-blue bg-brand-blue"
              : "border-border-3 bg-transparent"
          }`}
          aria-hidden
        >
          {selected && (
            <span className="h-2 w-2 rounded-full bg-surface-inverse" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body-lg font-semibold text-fg-1">
              {topic.title}
            </h3>
            {showStatusBadge && statusLabel(topic.status) && (
              <span
                className={`rounded-full px-2 py-0.5 text-xxs ${
                  isWinner
                    ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border border-border-1 bg-glass-1 text-fg-3"
                }`}
              >
                {statusLabel(topic.status)}
              </span>
            )}
          </div>

          {topic.description && (
            <p className="mt-2 text-body leading-6 text-fg-3">
              {topic.description}
            </p>
          )}

          <div className="mt-4 space-y-1.5">
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-glass-1"
              aria-hidden
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  selected
                    ? "bg-brand-blue"
                    : isWinner
                      ? "bg-emerald-500/70"
                      : "bg-glass-4"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xxs text-fg-4">
              <span>{topic.votes}표</span>
              <span>{pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
