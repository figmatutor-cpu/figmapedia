import Link from "next/link";
import { MentorList } from "@/components/mentors/MentorList";
import { getActiveMentors } from "@/lib/supabase/mentors";

export const revalidate = 600;

export default async function MentorsPage() {
  const mentors = await getActiveMentors();

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/" className="transition hover:text-fg-2">
            홈
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">멘토</span>
        </nav>

        <header className="mb-10 max-w-2xl">
          <p className="mb-2 text-xxs uppercase tracking-widest text-brand-blue-light">
            Mentors
          </p>
          <h1 className="text-h1 font-semibold text-fg-1 md:text-display">
            멘토를 만나보세요
          </h1>
          <p className="mt-3 text-body text-fg-3 md:text-body-lg">
            검증된 시니어 디자이너에게 1:1 피드백, 워크샵, 스터디 그룹 형태로
            성장의 도움을 받으세요. 멤버는 일부 세션을 무료로 이용할 수
            있습니다.
          </p>
        </header>

        {mentors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-12 text-center">
            <p className="text-body text-fg-3">멘토 시스템은 곧 오픈됩니다</p>
            <p className="mt-2 text-meta text-fg-4">
              첫 멘토 활성화는 베타 운영 4주 후를 목표로 합니다.
            </p>
          </div>
        ) : (
          <MentorList mentors={mentors} />
        )}
      </div>
    </main>
  );
}
