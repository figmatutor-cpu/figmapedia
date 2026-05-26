export function DiscordPanel() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  return (
    <div className="rounded-xl border border-border-1 bg-glass-1 p-6">
      <h3 className="text-body font-semibold text-fg-1">Discord 커뮤니티</h3>
      <p className="mt-3 text-body text-fg-3">
        실험 결과를 공유하고 피드백을 주고받는 Discord 채널입니다.
      </p>
      <a
        href={discordUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block rounded-full bg-brand-blue px-5 py-2.5 text-body font-medium text-fg-1 transition hover:bg-brand-blue-accent"
      >
        Discord 연결하기
      </a>
    </div>
  );
}
