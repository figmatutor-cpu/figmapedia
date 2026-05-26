interface Badge {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon: string | null;
}

interface EarnedBadge extends Badge {
  earned_at: string;
}

interface Props {
  earned: EarnedBadge[];
  available: Badge[];
}

function fmtDate(v: string): string {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("ko-KR");
  } catch {
    return v;
  }
}

function BadgeIcon({ icon }: { icon: string | null }) {
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border-1 bg-glass-1">
      <span aria-hidden className="text-h3">
        {icon ?? "🏅"}
      </span>
    </div>
  );
}

export function BadgeList({ earned, available }: Props) {
  const earnedIds = new Set(earned.map((b) => b.id));
  const notEarned = available.filter((b) => !earnedIds.has(b.id));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-body font-semibold text-fg-1">
          획득한 뱃지 ({earned.length})
        </h3>
        {earned.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
            <p className="text-meta text-fg-4">
              아직 획득한 뱃지가 없습니다. 첫 투표로 시작해보세요!
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {earned.map((b) => (
              <li
                key={b.id}
                className="flex items-start gap-3 rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-4"
              >
                <BadgeIcon icon={b.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-body font-semibold text-fg-1">
                      {b.label}
                    </h4>
                    <time className="flex-shrink-0 text-xxs text-fg-4">
                      {fmtDate(b.earned_at)}
                    </time>
                  </div>
                  {b.description && (
                    <p className="mt-1 text-meta text-fg-3">{b.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-body font-semibold text-fg-1">
          미획득 뱃지 ({notEarned.length})
        </h3>
        {notEarned.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
            <p className="text-meta text-fg-4">
              모든 뱃지를 획득했습니다. 축하합니다!
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {notEarned.map((b) => (
              <li
                key={b.id}
                className="flex items-start gap-3 rounded-xl border border-border-1 bg-glass-2 p-4 opacity-70"
              >
                <BadgeIcon icon={b.icon} />
                <div className="min-w-0 flex-1">
                  <h4 className="text-body font-semibold text-fg-2">
                    {b.label}
                  </h4>
                  {b.description && (
                    <p className="mt-1 text-meta text-fg-4">{b.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
