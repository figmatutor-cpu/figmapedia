import type { Metadata } from "next";
import { MentorSessionSuccessFlow } from "@/components/mentors/MentorSessionSuccessFlow";

export const metadata: Metadata = {
  title: "세션 신청 완료 | Figmapedia",
  description: "멘토 세션 결제가 완료되었습니다.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    mentorId?: string;
  }>;
}

export default async function MentorSessionSuccessPage({
  searchParams,
}: PageProps) {
  const { paymentKey, orderId, amount, mentorId } = await searchParams;

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-3xl px-6 py-12 md:py-16">
        <MentorSessionSuccessFlow
          paymentKey={paymentKey}
          orderId={orderId}
          amount={amount ? Number(amount) : undefined}
          mentorId={mentorId}
        />
      </div>
    </main>
  );
}
