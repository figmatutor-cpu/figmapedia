import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Footer } from "./Footer";
import { TitlePeriod } from "./TitlePeriod";
import { CONTACT_URL } from "./contact";
import { programs } from "./programs";
import styles from "./ai-workflow-course.module.css";
import courseStyles from "./figma-design-system-course.module.css";

const program = programs[1];
const sessions = [
  {
    title: "AI가 이해하는 디자인 시스템과 작업 환경 준비",
    hours: 1,
    description: "Figma 디자인 시스템을 MCP가 읽기 좋은 구조로 정리하고, 바이브 코딩을 위한 작업 환경을 설정합니다.",
    practice: ["Figma MCP 공식 도구와 외부 도구의 연결 방식 비교", "레이어 명명 규칙, 컴포넌트·베리언트, 디자인 토큰 정리", "디자인 토큰을 CSS 변수로 변환하고 HTML·CSS 기반 시스템 구성", "팀의 네이밍 규칙과 작업 원칙을 CLAUDE.md 초안으로 작성"],
    output: "MCP 읽기 적합성을 점검한 Figma 파일 · 디자인 시스템 코드 · 팀 공용 CLAUDE.md 초안",
  },
  {
    title: "디자인 하네스와 Claude 에이전트 워크플로우 설계",
    hours: 1,
    description: "우리 팀의 디자인 규칙을 문서와 프롬프트로 정리하고, 에이전트와 스킬이 같은 기준으로 작업하도록 연결합니다.",
    practice: ["디자인 가이드를 Claude 시스템 프롬프트로 정리해 코드 스타일 유지", "중복·복잡한 베리언트를 진단하고 구조화", "Design.md 작성과 에이전트·스킬·CLAUDE.md 조합 실습", "에이전트 병렬·순차 처리의 차이와 선택 기준, Loop·Goal 활용"],
    output: "디자인 기준을 정리한 Markdown 문서 · 프로젝트별 에이전트 설정 템플릿",
  },
  {
    title: "컴포넌트를 조합해 페이지와 프로토타입 제작",
    hours: 1,
    description: "디자인 시스템을 활용해 실제 페이지를 만들고, 기획 문서에서 와이어프레임으로 이어지는 흐름을 실습합니다.",
    practice: ["컴포넌트와 디자인 토큰으로 모바일·태블릿·데스크톱 화면 구성", "기획 문서와 Google Slides·Figma Slides를 바탕으로 페이지 제작", "HTML 기반 와이어프레임 생성", "컴포넌트·토큰을 확인할 수 있는 쇼케이스 페이지 제작"],
    output: "디자인 시스템을 적용한 반응형 웹 페이지 · 기획 문서 기반 와이어프레임",
  },
  {
    title: "디자인과 코드 사이의 차이를 확인하는 QA",
    hours: 1,
    description: "Figma 원본과 구현 화면을 비교하고, 팀에서 반복해 사용할 디자인 QA 기준을 만듭니다.",
    practice: ["Figma Dev Mode와 브라우저 DevTools로 원본·구현 결과 비교", "MCP를 활용해 불일치 항목을 찾고 수정 가이드 작성", "바이브 코딩 도구의 토큰 사용량과 모델별 작업 방식 비교", "검토 결과를 리포트와 체크리스트로 정리"],
    output: "디자인 QA 리포트 · 팀에 적용할 수 있는 QA 체크리스트",
  },
  {
    title: "코드로 만든 결과물을 Figma로 가져와 업데이트",
    hours: 2,
    description: "디자인 시스템 코드로 웹 페이지와 콘텐츠를 만들고, Figma 산출물로 연결하는 왕복 작업을 실습합니다.",
    practice: ["디자인 시스템 기반 웹 페이지, 프로모션 페이지, 배너 베리에이션 제작", "코드에 텍스트를 연결해 상세 페이지의 이미지·콘텐츠 변형", "완성한 결과물을 Figma 컴포넌트와 토큰 적용 산출물로 가져오기", "GitHub 기본 흐름을 익히고 작업 결과 업데이트"],
    output: "웹 페이지 베리에이션 · 상세 페이지와 배너 디자인 결과물",
  },
  {
    title: "Figma의 AI·셰이더·모션 기능으로 결과물 확장",
    hours: 1,
    description: "AI 에이전트와 Figma 기능을 활용해 디자인 시스템을 확장하고, 모션이 들어간 콘텐츠를 만들어봅니다.",
    practice: ["AI 에이전트를 활용한 디자인 시스템 가이드·플러그인 작업", "셰이더 이펙트 적용 실습", "Figma 모션과 에이전트로 간단한 애니메이션 제작"],
    output: "모션을 적용한 SNS 콘텐츠 또는 상세 페이지 결과물",
  },
];

export function FigmaDesignSystemCourse() {
  return <>
    <article className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.back} href="/#programs"><ArrowLeft size={16} aria-hidden="true" />교육 프로그램</Link>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Figma 디자인 시스템 · 디자인 하네스 · 바이브 코딩</p>
          <h1 className={courseStyles.lineBreaks}>{program.title.replace(" 기반으로 ", " 기반으로\n")}<TitlePeriod /></h1>
        </header>
        <div className={courseStyles.images}>
          <figure className={styles.figure}>
            <Image src="/images/education/figma-design-system.png" alt="AI가 이해하는 Figma 디자인 시스템의 조건과 레이어 명명 규칙을 설명하는 강의 슬라이드 4장" width={1241} height={757} priority sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 80px), 1120px" />
            <figcaption>강의 자료 미리보기 · 디자인 시스템 구조와 네이밍 규칙</figcaption>
          </figure>
          <figure className={styles.figure}>
            <Image src="/images/education/design-harness.png" alt="하네스·에이전트·스킬의 역할, CLAUDE.md 구성과 SKILL.md 작성 방법을 보여주는 강의 슬라이드 4장" width={1185} height={828} sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 80px), 1120px" />
            <figcaption>강의 자료 미리보기 · 우리 프로젝트에 맞는 하네스와 스킬 설계</figcaption>
          </figure>
        </div>
        <div className={styles.introduction}>
          <p className={styles.lead}>우리 팀의 디자인 기준을,<br />코드와 프로토타입까지.</p>
          <p>{program.description}</p>
        </div>
        <section aria-labelledby="curriculum-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>7시간 · 6세션 실습 과정</p><h2 id="curriculum-heading">기본 커리큘럼<TitlePeriod /></h2></div><p>Figma Design to Code로 이어지는<br />우리 팀의 워크플로우를 만듭니다.</p></div>
          <ol className={styles.modules}>{sessions.map((session, index) => <li key={session.title} className={styles.module}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div><p className={courseStyles.duration}>{session.hours}시간</p><h3>{session.title}</h3><p>{session.description}</p><ul>{session.practice.map(item => <li key={item}>{item}</li>)}</ul><p className={courseStyles.sessionOutput}><strong>실습 결과물</strong>{session.output}</p></div>
          </li>)}</ol>
          <p className={styles.note}>기본 과정은 7시간입니다. 팀의 디자인 시스템 준비 상태와 숙련도, 사용하는 도구·계정 환경에 맞춰 실습 범위를 함께 정합니다.</p>
        </section>
        <section className={styles.outcomes} aria-labelledby="audience-heading">
          <div><h2 id="audience-heading">함께하는 대상</h2><p>{program.audience}</p></div>
          <div><h2>함께 만들 결과물</h2><p className={courseStyles.lineBreaks}>{program.output}</p></div>
        </section>
      </div>
      <section className={styles.contact} aria-labelledby="course-contact-heading">
        <div className={styles.container}><p className={styles.eyebrow}>우리 팀의 디자인 시스템에서 시작하세요</p><h2 id="course-contact-heading">디자인 기준이 이어지는<br />AI 작업 환경을 만들어보세요<TitlePeriod /></h2><p>사용 중인 디자인 시스템과 구현하고 싶은 화면을 알려주세요.<br />팀에 맞는 실습 주제와 교육 범위를 함께 정하겠습니다.</p><a href={CONTACT_URL}>이 주제로 문의하기<ArrowUpRight size={20} aria-hidden="true" /></a></div>
      </section>
    </article>
    <Footer />
  </>;
}
