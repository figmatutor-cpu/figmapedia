import type { Metadata } from "next";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const metadata: Metadata = {
  title: "저작권 정책 - Figmapedia",
  description: "피그마피디아 저작권 정책 및 법적 고지",
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

export default function CopyrightPage() {
  return (
    <PolicyLayout title="저작권 정책 및 법적 고지">
      <Section title="제1조 (본 사이트 콘텐츠의 저작권)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            피그마피디아 운영진이 직접 창작하고 큐레이션 한 글, 디자인,
            튜토리얼, 데이터베이스(노션 DB 구조 등)에 대한 모든 저작권 및
            지적재산권은 &apos;피그마피디아&apos;에 귀속됩니다.
          </li>
          <li>
            본 사이트의 콘텐츠를 비상업적 목적(개인 학습, 사내 공유 등)으로
            이용할 경우 반드시{" "}
            <strong className="text-white">
              출처(피그마피디아 웹사이트 링크)
            </strong>
            를 명시해야 합니다.
          </li>
          <li>
            사전 협의 없는 무단 복제, 배포, 상업적 이용 및 타 플랫폼으로의
            전재를 엄격히 금지합니다.
          </li>
        </ol>
      </Section>

      <Section title="제2조 (상표권 및 공식 소속에 관한 고지)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Figma의 명칭, 로고 및 관련 상표는{" "}
            <strong className="text-white">Figma, Inc.</strong>의 등록
            상표입니다.
          </li>
          <li>
            <strong className="text-white">피그마피디아(Figmapedia)</strong>는
            디자이너들을 위한 독립적인 지식 공유 커뮤니티 및 정보 아카이브이며,
            Figma, Inc.와 공식적인 제휴 관계이거나 공식적으로 승인받은
            웹사이트가 아님을 밝힙니다.
          </li>
        </ol>
      </Section>

      <Section title="제3조 (외부 저작물 보호)">
        <p>
          본 사이트에서 소개하는 외부 레퍼런스 사이트, 플러그인, 폰트 등의
          저작권은 각 원작자 및 해당 플랫폼에 있습니다. 본 사이트는 해당 정보의
          링크 및 간략한 소개만을 제공합니다.
        </p>
      </Section>
    </PolicyLayout>
  );
}
