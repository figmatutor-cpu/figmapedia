export function NextLiveCard() {
  return (
    <div className="rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
      <span className="inline-block rounded-full border border-brand-blue/40 bg-brand-blue/15 px-3 py-1 text-xxs font-medium text-brand-blue-light">
        다음 라이브
      </span>
      <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">
        다음 라이브 일정이 곧 공개됩니다
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-400 md:text-base">
        매주 일요일 저녁, YouTube Live로 진행됩니다. 라이브는 누구나 무료로
        시청할 수 있고, 다시보기(VOD)는 멤버 전용으로 제공됩니다.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
        <span>매주 일요일</span>
        <span aria-hidden>·</span>
        <span>저녁 8시 (예정)</span>
        <span aria-hidden>·</span>
        <span>YouTube Live · 무료 시청</span>
      </div>
    </div>
  );
}
