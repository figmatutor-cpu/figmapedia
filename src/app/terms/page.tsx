import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const metadata: Metadata = {
  title: "서비스 이용약관 - Figmapedia",
  description: "피그마피디아 서비스 이용약관",
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

export default function TermsPage() {
  return (
    <PolicyLayout title="서비스 이용약관">
      <Section title="제1조 (목적)">
        <p>
          본 약관은 피그마피디아가 제공하는 모든 정보 및 서비스의 이용 조건,
          운영자와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (서비스의 제공 및 변경)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            본 사이트는 피그마(Figma) 사용법, 디자인 팁, UX/UI 레퍼런스 및 관련
            AI 검색 서비스 등을 무상으로 제공합니다.
          </li>
          <li>
            사이트 내의 콘텐츠와 서비스는 운영자의 판단에 따라 사전 공지 없이
            추가, 변경, 중단될 수 있습니다.
          </li>
        </ol>
      </Section>

      <Section title="제3조 (이용자의 의무)">
        <p>
          이용자는 본 사이트를 이용함에 있어 다음의 행위를 하여서는 안 됩니다.
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            사이트의 콘텐츠 및 데이터(노션 DB 포함)를 크롤링(Crawling)이나
            스크래핑(Scraping) 등 자동화된 프로그램으로 무단 수집하는 행위
          </li>
          <li>
            사이트의 서버에 과부하를 주거나 정상적인 운영을 방해하는 행위
            (디도스 공격, 악성코드 유포 등)
          </li>
          <li>
            기타 불법적이거나 부당한 목적을 위해 사이트를 이용하는 행위
          </li>
        </ol>
      </Section>

      <Section title="제4조 (면책 조항)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            본 사이트에서 제공하는 디자인 팁, 단축키 정보, AI 요약 결과 등은
            이용자의 편의를 돕기 위한 참고용이며, 그 내용의 완전성이나 100%
            정확성을 보증하지 않습니다.
          </li>
          <li>
            운영자는 본 사이트의 정보를 활용하여 발생한 이용자의 업무상 손실이나
            금전적 피해에 대해 어떠한 법적 책임도 지지 않습니다.
          </li>
          <li>
            본 사이트에 포함된 외부 웹사이트로의 링크(오픈채팅방, 타 레퍼런스
            사이트 등)에 대한 신뢰성이나 해당 사이트에서 발생한 문제에 대해서는
            책임지지 않습니다.
          </li>
        </ol>
      </Section>
    </PolicyLayout>
  );
}
