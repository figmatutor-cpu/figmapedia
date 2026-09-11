import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "./Footer";
import { TitlePeriod } from "./TitlePeriod";
import { CONTACT_URL } from "./contact";
import { programs } from "./programs";
import styles from "./ai-workflow-course.module.css";

const program = programs[0];
const agents = [
  { title: "경쟁사 분석 에이전트", description: "경쟁사 링크를 분석하고 게시물 이미지를 캡처해, 비교할 내용과 인사이트를 정리합니다.", output: "에이전트 정의 문서 · 경쟁사 분석 Google Slides" },
  { title: "콘텐츠 기획 에이전트", description: "경쟁사 분석 결과와 brand.md를 바탕으로 콘텐츠 콘셉트, 컷별 이미지와 카피, 대사와 촬영 가이드를 기획합니다.", output: "콘텐츠 기획 문서 · Google Docs와 Figma 결과물" },
  { title: "다국어 캡션 에이전트", description: "기획한 콘텐츠와 이미지를 읽고, 언어별 캡션·CTA 문구·해시태그를 작성합니다.", output: "콘텐츠별 다국어 캡션 Google Docs" },
  { title: "보고서 에이전트", description: "지정한 기간의 게시물을 수집하고 주소, 캡처 이미지, 좋아요 수를 보고서 템플릿에 정리합니다.", output: "게시물별 결과를 모은 Google Slides 보고서" },
];

export function AiWorkflowCourse() {
  return <>
    <article className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.back} href="/#programs"><ArrowLeft size={16} aria-hidden="true" />교육 프로그램</Link>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Claude Code 디자이너 교육 · AI 업무 자동화</p>
          <h1>{program.title}<TitlePeriod /></h1>
        </header>
        <figure className={styles.figure}>
          <Image src="/images/education/ai-workflow-curriculum.png" alt="콘텐츠 자동화 파이프라인, brand.md 작성 요소와 서비스 정보 정리 방법을 보여주는 강의 슬라이드 4장" width={1220} height={822} priority sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 80px), 1120px" />
          <figcaption>강의 자료 미리보기 · 자동화 구조 설계부터 브랜드 컨텍스트 작성까지</figcaption>
        </figure>
        <div className={styles.introduction}>
          <p className={styles.lead}>우리 팀의 일하는 방식을,<br />AI가 실행할 수 있는 흐름으로.</p>
          <p>{program.description}</p>
        </div>
        <section className={styles.curriculum} aria-labelledby="curriculum-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>직접 만들며 익히는 7시간</p><h2 id="curriculum-heading">기본 커리큘럼<TitlePeriod /></h2></div><p>콘텐츠 자동화를 실습 사례로 삼아<br />다른 반복 업무에도 적용할 수 있는 원리를 배웁니다.</p></div>
          <ol className={styles.modules}>
            <li className={styles.module}>
              <span className={styles.number}>01</span>
              <div><h3>자동화할 업무와 실행 순서 정하기</h3><p>한 번의 요청으로 모든 일을 맡겼을 때의 실패 사례를 살펴봅니다. 리서치부터 기획·제작까지 작업을 나누고, 사람이 판단할 단계와 AI가 실행할 단계를 구분합니다.</p><ul><li>수업에서 만들 자동화 흐름과 결과물 살펴보기</li><li>단계별 입력·출력과 검토 기준 정하기</li><li>하네스, 스킬, 서브 에이전트의 역할 이해하기</li></ul></div>
            </li>
            <li className={styles.module}>
              <span className={styles.number}>02</span>
              <div><h3>우리 조직의 컨텍스트 작성하기</h3><p>AI가 반복해서 참고할 브랜드 기준과 경쟁사 정보를 문서로 만듭니다. 분석 결과에 실무자의 요구사항을 더해 재사용할 수 있는 작업 기준을 정리합니다.</p><dl className={styles.documents}><div><dt>brand.md</dt><dd>브랜드 한 줄 소개, 제품·서비스, 말투와 언어, 이미지 스타일, 경쟁사 정보를 정리합니다.</dd></div><div><dt>competitor.md</dt><dd>주요 경쟁사 목록과 콘텐츠 특징, 비교·분석할 항목을 정의합니다.</dd></div></dl><p className={styles.tools}>실습 도구: Claude Code · Aside 또는 Apify MCP. 조직의 작업 환경에 맞춰 도구와 연결 방식을 조정합니다.</p></div>
            </li>
            <li className={styles.module}>
              <span className={styles.number}>03</span>
              <div><h3>역할별 에이전트 만들고 검증하기</h3><p>각 에이전트의 역할, 작업 절차, 사용할 모델, 산출물 형식을 정의합니다. 단계마다 실제로 실행해 보고 다음 작업에 넘길 수 있는 결과인지 검토합니다.</p><div className={styles.agents}>{agents.map((agent, index) => <section key={agent.title}><p className={styles.agentIndex}>실습 {index + 1}</p><h4>{agent.title}</h4><p>{agent.description}</p><p className={styles.output}><span>실습 결과물</span>{agent.output}</p></section>)}</div></div>
            </li>
            <li className={styles.module}>
              <span className={styles.number}>04</span>
              <div><h3>CLAUDE.md로 전체 워크플로우 연결하기</h3><p>요청에 따라 필요한 에이전트가 정해진 순서로 작동하도록 실행 원칙과 절차를 작성합니다. 우리 조직의 규칙을 반영한 하네스로 묶고 실전 프롬프트로 검증합니다.</p><ul><li>경쟁사 분석 → 콘텐츠 기획 → 다국어 캡션 → 보고서 흐름 연결</li><li>검토·승인이 필요한 지점과 재사용할 스킬 정리</li><li>전체 흐름을 실행하고 산출물 검증 및 개선</li></ul></div>
            </li>
          </ol>
          <p className={styles.note}>기본 과정은 7시간이며, 팀의 과제와 숙련도에 따라 실습 주제와 교육 범위를 함께 정합니다.</p>
        </section>
        <section className={styles.outcomes} aria-labelledby="audience-heading">
          <div><h2 id="audience-heading">함께하는 대상</h2><p>{program.audience}</p></div>
          <div><h2>함께 만들 결과물</h2><p>{program.output}</p></div>
        </section>
      </div>
      <section className={styles.contact} aria-labelledby="course-contact-heading">
        <div className={styles.container}><p className={styles.eyebrow}>우리 팀의 업무에서 시작하세요</p><h2 id="course-contact-heading">어떤 반복 업무를<br />먼저 바꾸고 싶으신가요<TitlePeriod /></h2><p>참여 직군, 개선하고 싶은 업무, 희망 일정을 알려주세요.<br />팀에 맞는 실습 주제와 교육 범위를 함께 정하겠습니다.</p><a href={CONTACT_URL}>이 주제로 문의하기</a></div>
      </section>
    </article>
    <Footer />
  </>;
}
