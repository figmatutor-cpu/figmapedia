import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MentorProfile } from "@/components/mentors/MentorProfile";
import {
  getMentorById,
  getMentorReviews,
  getMentorSessions,
} from "@/lib/supabase/mentors";

const HAS_TOSS_KEY = Boolean(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mentor = await getMentorById(id);
  if (!mentor) return { title: "멘토 | Figmapedia" };

  const description = mentor.mentor_intro
    ? mentor.mentor_intro.replace(/\s+/g, " ").slice(0, 160)
    : `${mentor.display_name} 멘토 프로필`;

  return {
    title: `${mentor.display_name} | 멘토 | Figmapedia`,
    description,
    openGraph: {
      title: `${mentor.display_name} — ${mentor.mentor_title ?? "멘토"}`,
      description,
      type: "profile",
    },
  };
}

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = await getMentorById(id);
  if (!mentor) notFound();

  const [sessions, reviews] = await Promise.all([
    getMentorSessions(id),
    getMentorReviews(id, 5),
  ]);

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-5xl px-6 py-10 md:py-14">
        <nav className="mb-8 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/" className="transition hover:text-fg-2">
            홈
          </Link>
          <span aria-hidden>›</span>
          <Link href="/mentors" className="transition hover:text-fg-2">
            멘토
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">{mentor.display_name}</span>
        </nav>

        <MentorProfile mentor={mentor} sessions={sessions} reviews={reviews} />

        {!HAS_TOSS_KEY && (
          <section className="mt-10 rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-6 md:p-8">
            <h2 className="text-h3 font-semibold text-fg-1">
              세션 신청은 곧 오픈됩니다
            </h2>
            <p className="mt-2 text-meta text-fg-2">
              결제 시스템 연동이 완료되면 위 세션 카드에서 바로 신청할 수 있게
              됩니다. 그동안은 멤버 채널을 통해 운영자에게 문의해주세요.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
