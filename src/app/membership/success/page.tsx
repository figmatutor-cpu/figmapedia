import type { Metadata } from "next";
import { MembershipSuccessFlow } from "@/components/membership/MembershipSuccessFlow";

export const metadata: Metadata = {
  title: "결제 완료 | 디자이너의 AI 실험실 | Figmapedia",
  description: "멤버십 결제가 완료되었습니다. 디스코드 커뮤니티 참여 안내.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    planType?: string;
  }>;
}

export default async function MembershipSuccessPage({
  searchParams,
}: PageProps) {
  const { paymentKey, orderId, amount, planType } = await searchParams;

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto max-w-3xl px-6 py-12 md:py-16">
        <MembershipSuccessFlow
          paymentKey={paymentKey}
          orderId={orderId}
          amount={amount ? Number(amount) : undefined}
          planType={
            planType === "annual" || planType === "monthly"
              ? planType
              : undefined
          }
        />
      </div>
    </main>
  );
}
