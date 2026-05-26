interface ActivityRow {
  id: string;
  type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Props {
  activities: ActivityRow[];
}

const TYPE_LABEL: Record<string, string> = {
  vote: "주제 투표",
  comment: "댓글 작성",
  share: "결과 공유",
  live_attend: "라이브 시청",
  live_present: "라이브 발표",
  experiment_contribute: "실험 기여",
  study_room_book: "스터디룸 예약",
  mentor_session_book: "멘토 세션 신청",
};

const TYPE_BADGE: Record<string, string> = {
  vote: "border-brand-blue/40 bg-brand-blue/15 text-brand-blue-light",
  comment: "border-border-1 bg-glass-1 text-fg-2",
  share: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  live_attend: "border-border-1 bg-glass-1 text-fg-2",
  live_present: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  experiment_contribute:
    "border-brand-blue/40 bg-brand-blue/15 text-brand-blue-light",
  study_room_book: "border-border-1 bg-glass-1 text-fg-2",
  mentor_session_book: "border-border-1 bg-glass-1 text-fg-2",
};

function fmtDateTime(v: string): string {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString("ko-KR");
  } catch {
    return v;
  }
}

function describe(row: ActivityRow): string {
  const meta = row.metadata ?? {};
  if (row.type === "vote") {
    const title =
      typeof meta.topic_title === "string" ? meta.topic_title : null;
    return title ? `"${title}"에 투표` : "주제 투표 참여";
  }
  if (row.type === "study_room_book") {
    const slot = typeof meta.time_slot === "string" ? meta.time_slot : null;
    const date = typeof meta.reserved_at === "string" ? meta.reserved_at : null;
    return date ? `${date} ${slot ?? ""} 슬롯 예약` : "스터디룸 예약";
  }
  return TYPE_LABEL[row.type] ?? row.type;
}

export function ActivityList({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
        <p className="text-meta text-fg-4">
          아직 활동 내역이 없습니다. /ai-lab/vote에서 첫 투표를 시작해보세요.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li
          key={a.id}
          className="rounded-xl border border-border-1 bg-glass-2 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xxs ${
                    TYPE_BADGE[a.type] ?? "border-border-1 bg-glass-1 text-fg-2"
                  }`}
                >
                  {TYPE_LABEL[a.type] ?? a.type}
                </span>
              </div>
              <p className="mt-2 text-body text-fg-1">{describe(a)}</p>
            </div>
            <time
              className="flex-shrink-0 text-xxs text-fg-4"
              dateTime={a.created_at}
            >
              {fmtDateTime(a.created_at)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
