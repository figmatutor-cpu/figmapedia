export function SpaceInfo() {
  const address =
    process.env.NEXT_PUBLIC_STUDY_ROOM_ADDRESS ??
    "서울시 (주소는 예약 확정 시 안내)";
  const hours =
    process.env.NEXT_PUBLIC_STUDY_ROOM_HOURS ?? "평일 10:00 ~ 22:00";

  return (
    <div className="rounded-xl border border-border-1 bg-glass-1 p-6 md:p-8">
      <h2 className="text-body-lg font-semibold text-fg-1 md:text-h3">
        오프라인 스터디 공간
      </h2>
      <p className="mt-3 text-body text-fg-3">
        멤버는 디자이너의 AI 실험실 오프라인 공간을 무료로 이용할 수 있습니다.
      </p>

      <dl className="mt-6 space-y-4 text-body">
        <div>
          <dt className="text-meta text-fg-4">위치</dt>
          <dd className="mt-1 text-fg-2">{address}</dd>
        </div>
        <div>
          <dt className="text-meta text-fg-4">운영 시간</dt>
          <dd className="mt-1 text-fg-2">{hours}</dd>
        </div>
        <div>
          <dt className="text-meta text-fg-4">시간대</dt>
          <dd className="mt-1 space-y-1 text-fg-2">
            <p>오전 10:00 ~ 13:00</p>
            <p>오후 13:00 ~ 17:00</p>
            <p>저녁 18:00 ~ 22:00</p>
          </dd>
        </div>
      </dl>

      <div className="mt-8 rounded-lg border border-border-1 bg-glass-1 p-4">
        <h3 className="text-meta font-semibold text-fg-1">이용 안내</h3>
        <ul className="mt-3 space-y-1.5 text-meta leading-6 text-fg-3">
          <li>· 예약 후 운영자 확인이 완료되면 위치/출입 정보를 안내합니다</li>
          <li>· 동일 시간대는 1팀만 사용 가능합니다</li>
          <li>· 노쇼가 반복될 경우 이용이 제한될 수 있습니다</li>
          <li>· 음식물 반입 시 정리는 본인 책임입니다</li>
        </ul>
      </div>
    </div>
  );
}
