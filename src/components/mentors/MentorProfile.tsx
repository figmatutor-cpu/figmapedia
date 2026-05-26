import type {
  MentorReview,
  MentorSession,
  MentorWithStats,
} from "@/types/mentor";
import { SESSION_TYPE_LABEL } from "@/types/mentor";

interface Props {
  mentor: MentorWithStats;
  sessions: MentorSession[];
  reviews: MentorReview[];
}

function fmtPrice(price: number): string {
  if (price === 0) return "멤버 전용 무료";
  return `₩${price.toLocaleString("ko-KR")}`;
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

export function MentorProfile({ mentor, sessions, reviews }: Props) {
  const ratingDisplay =
    mentor.review_count > 0 ? mentor.avg_rating.toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border-1 bg-glass-2 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-1 bg-glass-1">
            {mentor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.avatar_url}
                alt={mentor.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-h2 text-fg-4">
                {mentor.display_name.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-h1 font-semibold text-fg-1">
              {mentor.display_name}
            </h1>
            {mentor.mentor_title && (
              <p className="mt-1 text-body text-fg-3">{mentor.mentor_title}</p>
            )}
            {mentor.specialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {mentor.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border-1 bg-glass-1 px-3 py-1 text-xxs text-fg-3"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-meta text-fg-4">
              <span>
                ⭐ {ratingDisplay}{" "}
                {mentor.review_count > 0 && `(리뷰 ${mentor.review_count}개)`}
              </span>
              <span aria-hidden>·</span>
              <span>완료 세션 {mentor.completed_sessions}회</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-6">
          {mentor.mentor_intro && (
            <section className="rounded-xl border border-border-1 bg-glass-2 p-6">
              <h2 className="text-body font-semibold text-fg-1">멘토 소개</h2>
              <p className="mt-3 whitespace-pre-line text-body text-fg-2">
                {mentor.mentor_intro}
              </p>
            </section>
          )}

          {mentor.career.length > 0 && (
            <section className="rounded-xl border border-border-1 bg-glass-2 p-6">
              <h2 className="text-body font-semibold text-fg-1">주요 경력</h2>
              <ul className="mt-4 space-y-3">
                {mentor.career.map((c, idx) => (
                  <li
                    key={`${c.title}-${idx}`}
                    className="border-l-2 border-border-2 pl-4"
                  >
                    <div className="text-body text-fg-1">{c.title}</div>
                    <div className="mt-0.5 text-meta text-fg-4">
                      {c.company} · {c.period}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-border-1 bg-glass-2 p-6">
            <h2 className="text-body font-semibold text-fg-1">
              멤버 후기 ({mentor.review_count})
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-meta text-fg-4">
                아직 등록된 후기가 없습니다.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border-1 bg-glass-1 p-4"
                  >
                    <div className="flex items-center justify-between text-xxs text-fg-4">
                      <span>⭐ {r.rating}.0</span>
                      <time dateTime={r.created_at}>
                        {fmtDate(r.created_at)}
                      </time>
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-meta text-fg-2">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 md:w-80">
          {sessions.length === 0 ? (
            <section className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-6 text-center">
              <p className="text-meta text-fg-4">
                현재 등록된 세션이 없습니다.
              </p>
            </section>
          ) : (
            sessions.map((s) => (
              <section
                key={s.id}
                className="rounded-xl border border-border-1 bg-glass-2 p-5"
              >
                <span className="inline-block rounded-full border border-border-1 bg-glass-1 px-2.5 py-0.5 text-xxs text-fg-3">
                  {SESSION_TYPE_LABEL[s.type]}
                </span>
                <h3 className="mt-3 text-body font-semibold text-fg-1">
                  {s.title}
                </h3>
                {s.description && (
                  <p className="mt-2 text-meta text-fg-3">{s.description}</p>
                )}
                <dl className="mt-4 space-y-1.5 text-meta">
                  <div className="flex justify-between">
                    <dt className="text-fg-4">비용</dt>
                    <dd className="text-fg-1">{fmtPrice(s.price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-fg-4">소요 시간</dt>
                    <dd className="text-fg-2">{s.duration_minutes}분</dd>
                  </div>
                  {s.schedule_text && (
                    <div className="flex justify-between">
                      <dt className="text-fg-4">가능 시간</dt>
                      <dd className="text-fg-2">{s.schedule_text}</dd>
                    </div>
                  )}
                </dl>
              </section>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
