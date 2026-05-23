import Link from "next/link";

export function AiLabHeader() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          AI 실험실
        </h1>
        <p className="mt-3 text-sm text-gray-400 md:text-base">
          매주 새로운 주제로 진행되는 디자인 AI 실험 공간입니다.
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <Link
          href="/membership"
          className="text-sm text-gray-300 transition hover:text-white"
        >
          멤버십
        </Link>
        <a
          href={discordUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-accent"
        >
          Discord 커뮤니티 참여하기
        </a>
      </div>
    </header>
  );
}
