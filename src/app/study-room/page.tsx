import { ReservationCenter } from "@/components/study-room/ReservationCenter";
import { SpaceInfo } from "@/components/study-room/SpaceInfo";

export default function StudyRoomPage() {
  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            스터디 공간
          </h1>
          <p className="mt-3 text-sm text-gray-400 md:text-base">
            멤버 전용 오프라인 스터디 공간을 예약하세요. 신청 후 운영자 확인을
            거쳐 확정됩니다.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <SpaceInfo />
          <ReservationCenter />
        </div>
      </div>
    </main>
  );
}
