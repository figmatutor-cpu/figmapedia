export type TimeSlot = "morning" | "afternoon" | "evening";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface Reservation {
  id: string;
  user_id: string;
  reserved_at: string;
  time_slot: TimeSlot;
  status: ReservationStatus;
  note: string | null;
  created_at: string;
}

export const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "오전 (10:00 ~ 13:00)",
  afternoon: "오후 (13:00 ~ 17:00)",
  evening: "저녁 (18:00 ~ 22:00)",
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "확인 대기",
  confirmed: "예약 확정",
  cancelled: "취소됨",
};
