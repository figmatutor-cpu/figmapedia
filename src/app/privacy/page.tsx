import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const metadata: Metadata = {
  title: "개인정보 처리방침 - Figmapedia",
  description: "피그마피디아 개인정보 처리방침",
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
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <PolicyLayout title="개인정보 처리방침">
      <Section title="제1조 (목적)">
        <p>
          피그마피디아(이하 &apos;본 사이트&apos;)는 방문자의 개인정보를
          보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과
          같이 개인정보 처리방침을 수립·공개합니다.
        </p>
      </Section>

      <Section title="제2조 (수집하는 개인정보의 항목 및 수집 방법)">
        <p>
          본 사이트는 별도의 회원가입 절차를 요구하지 않으며, 사이트 이용 시
          아래와 같은 정보가 자동으로 생성되어 수집될 수 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-white font-medium">자동 수집 항목:</span>{" "}
            접속 IP 주소, 쿠키(Cookie), 방문 일시, 서비스 이용 기록, 브라우저 및
            OS 정보
          </li>
          <li>
            <span className="text-white font-medium">자발적 제공 항목:</span>{" "}
            문의하기, 오류 제보, 오픈채팅방 등을 통해 방문자가 자발적으로
            제공하는 이메일 주소, 이름(닉네임) 등
          </li>
        </ul>
      </Section>

      <Section title="제3조 (개인정보의 처리 목적)">
        <p>수집된 정보는 다음의 목적을 위해서만 활용됩니다.</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            웹사이트 접속 빈도 파악 및 서비스 이용에 대한 통계 분석 (예: 구글
            애널리틱스 활용)
          </li>
          <li>
            사용자 경험(UX) 개선 및 맞춤형 콘텐츠(AI 검색 결과 등) 제공
          </li>
          <li>서비스 오류 수정 및 문의 사항에 대한 답변 제공</li>
        </ol>
      </Section>

      <Section title="제4조 (개인정보의 보유 및 이용 기간)">
        <p>
          방문자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이
          달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는
          경우 해당 법령에서 정한 기간 동안 보관합니다.
        </p>
      </Section>

      <Section title="제5조 (문의처)">
        <p>
          개인정보 보호와 관련된 문의 사항은 아래의 연락처로 문의해 주시기
          바랍니다.
        </p>
        <ul className="list-disc pl-5">
          <li>
            이메일:{" "}
            <a
              href="mailto:yiseo@figmatutor.info"
              className="text-[#6C79FF] hover:underline"
            >
              yiseo@figmatutor.info
            </a>
          </li>
        </ul>
      </Section>
    </PolicyLayout>
  );
}
