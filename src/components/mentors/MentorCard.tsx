import Link from "next/link";
import type { MentorWithStats } from "@/types/mentor";

interface Props {
  mentor: MentorWithStats;
}

export function MentorCard({ mentor }: Props) {
  const ratingDisplay =
    mentor.review_count > 0 ? mentor.avg_rating.toFixed(1) : "—";

  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-border-1 bg-glass-2 p-5 transition hover:border-border-2 hover:bg-glass-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-1 bg-glass-1">
          {mentor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.avatar_url}
              alt={mentor.display_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-meta text-fg-4">
              {mentor.display_name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-body font-semibold text-fg-1">
            {mentor.display_name}
          </h3>
          {mentor.mentor_title && (
            <p className="mt-0.5 line-clamp-1 text-meta text-fg-3">
              {mentor.mentor_title}
            </p>
          )}
        </div>
      </div>

      {mentor.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full border border-border-1 bg-glass-1 px-2.5 py-0.5 text-xxs text-fg-3"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border-1 pt-3 text-xxs text-fg-4">
        <span>
          ⭐ {ratingDisplay}
          {mentor.review_count > 0 && (
            <span className="ml-1">({mentor.review_count}건)</span>
          )}
        </span>
        <span>세션 {mentor.completed_sessions}회</span>
      </div>
    </Link>
  );
}
