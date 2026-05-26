import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const metadata: Metadata = {
  title: "환불 정책 - Figmapedia",
  description: "디자이너의 AI 실험실 멤버십 환불 정책",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-fg-1 text-h3 font-semibold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="환불 정책">
      <Section title="제1조 (목적)">
        <p>
          본 환불 정책은 피그마피디아가 운영하는 디자이너의 AI 실험실
          멤버십(이하 &quot;멤버십&quot;)의 환불 절차와 기준을 규정함을 목적으로
          합니다.
        </p>
      </Section>

      <Section title="제2조 (청약 철회)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            전자상거래법에 따라 멤버십 결제일로부터 7일 이내, 멤버 전용 콘텐츠를
            일절 이용하지 않은 경우 전액 환불이 가능합니다.
          </li>
          <li>
            멤버 전용 리포트 본문, 라이브 다시보기(VOD), 스터디 공간 예약 등
            멤버 전용 콘텐츠를 1회라도 이용한 경우, 디지털 콘텐츠 공급이 개시된
            것으로 보아 청약 철회가 제한될 수 있습니다.
          </li>
        </ol>
      </Section>

      <Section title="제3조 (월간 멤버십 환불)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            월간 멤버십은 매월 자동 결제됩니다. 다음 결제일 전까지 해지 신청 시
            다음 회차 결제가 중단되며, 이번 회차 결제분은 환불되지 않습니다.
          </li>
          <li>
            결제일로부터 7일 이내이고 이용 내역이 없는 경우, 제2조에 따라 전액
            환불이 가능합니다.
          </li>
        </ol>
      </Section>

      <Section title="제4조 (연간 멤버십 환불)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>연간 멤버십은 1년 단위로 일시 결제됩니다.</li>
          <li>
            결제일로부터 7일 이내이고 이용 내역이 없는 경우 전액 환불이
            가능합니다.
          </li>
          <li>
            7일 경과 후 환불 요청 시, 이미 경과한 개월 수에 대해서는 월간
            정가(₩5,900)를 차감하고 잔여 개월 수에 대해 일할 환불됩니다.
          </li>
        </ol>
      </Section>

      <Section title="제5조 (환불 신청 방법)">
        <p>
          다음 이메일로 환불 신청을 접수합니다. 신청 시 아래 정보를 함께 전달해
          주세요.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>가입 이메일 주소</li>
          <li>결제일 및 결제 수단</li>
          <li>환불 사유</li>
        </ul>
        <p className="pt-2">
          이메일:{" "}
          <a
            href="mailto:yiseo@figmatutor.info"
            className="text-[#6C79FF] hover:underline"
          >
            yiseo@figmatutor.info
          </a>
        </p>
      </Section>

      <Section title="제6조 (환불 처리 기간)">
        <p>
          환불 신청 접수 후 영업일 기준 3~5일 이내에 결제 수단으로 환불됩니다.
          카드사·결제 대행사 사정에 따라 실제 입금 시점이 지연될 수 있습니다.
        </p>
      </Section>

      <Section title="제7조 (정책 변경)">
        <p>
          본 환불 정책은 관련 법령 또는 서비스 운영상 필요에 따라 변경될 수
          있으며, 변경 시 사이트를 통해 사전에 공지합니다.
        </p>
      </Section>

      <p className="text-meta text-fg-4 pt-6">
        본 정책은 디자이너의 AI 실험실 멤버십 정식 오픈 시점에 발효됩니다. 멘토
        유료 세션 등 추가 유료 서비스의 환불 정책은 해당 서비스 오픈 시 별도로
        고지합니다.
      </p>
    </PolicyLayout>
  );
}
