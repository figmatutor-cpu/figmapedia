import Link from "next/link";

interface MembershipPageProps {
  searchParams: Promise<{ reason?: string; next?: string }>;
}

const BENEFITS: { title: string; description: string }[] = [
  {
    title: "실험 리포트 전체 본문",
    description:
      "매주 발행되는 AI 실험 리포트의 30% 요약을 넘어, 전체 본문과 디테일을 모두 열람할 수 있습니다.",
  },
  {
    title: "라이브 다시보기 (VOD)",
    description:
      "유튜브 라이브 세션은 누구나 무료 시청. 다시보기는 멤버에게만 비공개 링크로 제공됩니다.",
  },
  {
    title: "오프라인 스터디 공간",
    description:
      "디자이너의 AI 실험실 오프라인 공간을 무료로 예약하고 사용할 수 있습니다.",
  },
  {
    title: "Discord 커뮤니티",
    description:
      "주간 실험에 참여하고, 결과를 공유하고, 다른 멤버와 피드백을 주고받는 커뮤니티에 입장합니다.",
  },
];

export default async function MembershipPage({
  searchParams,
}: MembershipPageProps) {
  const { reason } = await searchParams;
  const fromMemberOnly = reason === "member_only";

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-4xl px-6 py-12 md:py-16">
        <nav className="mb-8 flex items-center gap-2 text-meta text-fg-4">
          <Link href="/ai-lab" className="transition hover:text-fg-2">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <span className="text-fg-3">멤버십</span>
        </nav>

        {fromMemberOnly && (
          <div className="mb-8 rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-4 text-body text-brand-blue-light">
            이 콘텐츠는 멤버 전용입니다. 멤버십이 오픈되면 바로 이용할 수
            있습니다.
          </div>
        )}

        <header className="max-w-2xl">
          <p className="mb-3 text-xxs uppercase tracking-widest text-brand-blue-light">
            Membership
          </p>
          <h1 className="text-h1 font-semibold leading-snug text-fg-1 md:text-display">
            멤버십이 곧 오픈됩니다
          </h1>
          <p className="mt-4 text-body leading-7 text-fg-3 md:text-body-lg">
            토스페이먼츠 결제 시스템을 연동 중입니다. 가맹 심사가 완료되는 대로
            정식 오픈하며, Discord 커뮤니티 공지로 알림드립니다.
          </p>
        </header>

        <section className="mt-12">
          <h2 className="mb-4 text-meta uppercase tracking-widest text-fg-4">
            멤버 혜택
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border-1 bg-glass-1 p-5"
              >
                <h3 className="text-body-lg font-semibold text-fg-1">
                  {b.title}
                </h3>
                <p className="mt-2 text-body leading-6 text-fg-3">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-meta uppercase tracking-widest text-fg-4">
            요금
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border-1 bg-glass-1 p-6">
              <h3 className="text-body text-fg-3">월간</h3>
              <p className="mt-2 text-h1 font-semibold text-fg-1">
                5,900
                <span className="ml-1 text-body-lg font-normal text-fg-3">
                  원 / 월
                </span>
              </p>
              <p className="mt-3 text-meta text-fg-4">
                매월 자동 결제 · 언제든 해지 가능
              </p>
            </div>
            <div className="rounded-xl border border-brand-blue/40 bg-brand-blue/10 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-body text-brand-blue-light">연간</h3>
                <span className="rounded-full border border-brand-blue/40 bg-brand-blue/20 px-2.5 py-0.5 text-xxs font-medium text-brand-blue-light">
                  31% 할인
                </span>
              </div>
              <p className="mt-2 text-h1 font-semibold text-fg-1">
                49,000
                <span className="ml-1 text-body-lg font-normal text-fg-2">
                  원 / 년
                </span>
              </p>
              <p className="mt-3 text-meta text-fg-2">
                월 4,083원 효과 · 1년 단건 결제
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
          <h2 className="text-body-lg font-semibold text-fg-1">
            오픈 알림 받기
          </h2>
          <p className="mt-2 text-body leading-6 text-fg-3">
            정식 오픈은 Discord 커뮤니티에서 가장 먼저 안내드립니다. 지금
            참여하시면 베타 혜택과 첫 달 프로모(990원)도 받아보실 수 있어요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-blue px-5 py-2.5 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent"
            >
              Discord 커뮤니티 참여하기
            </a>
            <Link
              href="/ai-lab"
              className="rounded-full border border-border-1 bg-glass-1 px-5 py-2.5 text-body font-medium text-fg-2 transition hover:border-border-2 hover:bg-glass-2"
            >
              AI 실험실로 돌아가기
            </Link>
          </div>
        </section>

        <p className="mt-8 text-xxs text-fg-5">
          요금 및 혜택은 오픈 시점에 일부 변경될 수 있습니다.
        </p>
      </div>
    </main>
  );
}
