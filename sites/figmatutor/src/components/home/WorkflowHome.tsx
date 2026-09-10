"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { LectureHistory } from "./LectureHistory";
import history from "@/data/lectures.json";
import styles from "./workflow-home.module.css";

const programs = [
  { number: "01", title: "AI를 일의 흐름 안으로", topic: "AI 워크플로우 · 업무 자동화", description: "리서치, 아이디어 정리, 문서 작성. 반복되는 업무를 찾아 AI를 연결하고, 결과를 검토하는 기준까지 함께 설계합니다.", audience: "디자이너 · PM · IT 실무자", output: "업무별 AI 활용 흐름과 검토 체크리스트" },
  { number: "02", title: "다시 만들지 않는 디자인", topic: "Figma · 디자인 시스템", description: "개별 화면 제작을 넘어 컴포넌트와 변수, 라이브러리 운영 방식을 정리합니다. 팀이 함께 쓰고 유지할 수 있는 작업 기준을 만듭니다.", audience: "디자이너 · 디자인 리드", output: "재사용 가능한 컴포넌트 구조와 운영 기준" },
  { number: "03", title: "전달에서 끊기지 않는 협업", topic: "기획 · 디자인 · 개발 연결", description: "요구사항부터 프로토타입, 개발 전달까지. 직군 사이에서 반복되는 설명과 수정 요청을 살펴보고 협업 과정을 정리합니다.", audience: "PM · 디자이너 · 개발자", output: "핸드오프 체크리스트와 팀 협업 가이드" },
];
const resources = [
  ["AI & Figma 실무 팁", "막히는 작업에서 바로 찾아보는 Q&A", "/figma-info"],
  ["프롬프트 피디아", "업무에 맞게 바꿔 쓰는 프롬프트", "/prompt-pedia"],
  ["디자인 리소스", "템플릿과 튜토리얼로 시작하는 실습", "/figma-resource"],
  ["UX/UI 스터디", "설계의 근거를 넓히는 아티클과 용어", "/uxui-study"],
  ["AI 리포트", "실무에 연결해 읽는 AI 소식", "/ai-report"],
  ["키오스크 레퍼런스", "실제 사용 맥락을 살펴보는 화면 사례", "/kiosk-food"],
];
const contactHref = `mailto:yiseo@figmatutor.info?subject=${encodeURIComponent("교육·워크플로우 컨설팅 문의")}&body=${encodeURIComponent("안녕하세요. 교육·컨설팅을 문의드립니다.\n\n소속 / 담당 업무:\n참여 직군 / 인원:\n현재 어려운 업무:\n희망하는 변화:\n희망 일정 / 진행 방식:\n")}`;

export function WorkflowHome() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroTop}><span className={styles.eyebrow}>WORKFLOW EDUCATION & CONSULTING</span><span className={styles.heroAudience}>디자이너와 IT 팀을 위한 교육·컨설팅</span></div>
        <div className={styles.heroGrid}>
          <div>
            <h1 id="home-heading">일하는 방식을 바꾸면,<br /><span>가능한 일이 달라집니다.</span></h1>
            <p className={styles.intro}>반복 업무는 줄이고, 중요한 판단에 집중하도록.<br />AI와 Figma를 실무에 연결해<br className={styles.mobileBreak} /> 여러분과 팀의 워크플로우를 함께 설계합니다.</p>
            <div className={styles.actions}><a className={styles.primary} href="#contact">교육·컨설팅 문의 <ArrowUpRight size={19} /></a><a className={styles.textLink} href="#programs">함께 개선할 수 있는 일 <ArrowDown size={17} /></a></div>
          </div>
          <div className={styles.workflow} aria-label="업무 파악, 흐름 설계, 실무 적용으로 이어지는 워크플로우 개선 과정">
            <div className={styles.sheetHeader}><span>OUR WAY OF WORKING</span><span>↗</span></div>
            <p className={styles.sheetTitle}>우리 팀의 일,<br />더 나은 흐름으로.</p>
            <div className={styles.flowStep}><span>01</span><div><strong>업무를 들여다보고</strong><p>반복 작업 · 협업의 병목</p></div><Plus size={16} /></div>
            <div className={styles.flowStep}><span>02</span><div><strong>맞는 방법을 설계하고</strong><p>AI 활용 · 시스템 · 팀의 기준</p></div><Plus size={16} /></div>
            <div className={`${styles.flowStep} ${styles.flowFinal}`}><span>03</span><div><strong>현업에서 써봅니다</strong><p>실습 · 피드백 · 업무에 적용</p></div><Check size={18} /></div>
            <div className={styles.sheetFooter}>도구의 활용에서, 팀의 일하는 방식까지.</div>
          </div>
        </div>
        <div className={styles.heroBottom}><span>AI WORKFLOW</span><span>DESIGN SYSTEM</span><span>TEAM COLLABORATION</span><a href="#approach" aria-label="접근 방식 살펴보기"><ArrowDown size={20} /></a></div>
      </section>

      <div className={styles.clientStrip}><p>삼성SDS · 카카오 · NHN · 현대자동차 · 카카오뱅크 등<br /><strong>{history.lectures.length}개 조직의 강의 진행 이력</strong></p><a href="#experience">강의·자문 이력 보기 <ArrowDown size={16} /></a></div>

      <section id="approach" className={styles.approach} aria-labelledby="approach-heading">
        <span className={styles.eyebrow}>01 / APPROACH</span>
        <div><h2 id="approach-heading">새로운 도구를 배우는 일에서<br />내 업무가 달라지는 경험으로.</h2><p>기능을 아는 것과 현업에서 활용하는 것 사이에는 간격이 있습니다. 어떤 업무를 줄이고 싶은지, 어느 단계에서 협업이 막히는지부터 함께 살펴봅니다.</p><p>교육의 출발점은 여러분의 실제 업무입니다. 팀의 역할과 숙련도에 맞춰 배우고, 직접 적용하고, 계속 사용할 수 있는 방법을 정리합니다.</p><div className={styles.signature}><Image src="/images/team/figma_tutor.png" alt="피그마 튜터 프로필" width={48} height={48} /><div><strong>피그마 튜터</strong><span>워크플로우 교육 · 컨설팅</span></div></div></div>
      </section>

      <section id="programs" className={styles.programs} aria-labelledby="programs-heading">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>02 / WHAT WE CAN WORK ON</span><h2 id="programs-heading">어떤 일을 더 잘하고 싶으세요?</h2></div><p>팀의 과제와 숙련도에 따라<br />교육과 컨설팅의 범위를 함께 정합니다.</p></div>
        <div>{programs.map(program => <article className={styles.program} key={program.number}><span className={styles.programNumber}>{program.number}</span><div><span className={styles.topic}>{program.topic}</span><h3>{program.title}</h3><p>{program.description}</p></div><div className={styles.programDetails}><span>함께하는 대상</span><p>{program.audience}</p><span>함께 만들 결과물</span><p>{program.output}</p><a href={contactHref}>이 주제로 문의하기 <ArrowUpRight size={16} /></a></div></article>)}</div>
      </section>

      <LectureHistory />

      <section className={styles.process} aria-labelledby="process-heading"><div className={styles.sectionHeading}><div><span className={styles.eyebrow}>04 / HOW WE WORK</span><h2 id="process-heading">배운 다음 날에도<br />이어지는 변화.</h2></div><p>한 번의 강의부터 팀 단위 컨설팅까지.<br />필요한 깊이에 맞춰 함께합니다.</p></div><ol className={styles.processSteps}>{[
        ["진단", "지금의 업무를 이해합니다", "참여 직군, 사용하는 도구, 반복되는 작업과 협업의 어려움을 살펴봅니다."],
        ["설계와 교육", "우리 팀의 사례로 배웁니다", "실제 과제를 바탕으로 커리큘럼을 구성하고, 적용 방법을 함께 실습합니다."],
        ["적용과 정리", "계속 쓸 수 있게 남깁니다", "실습 결과를 검토하고 템플릿과 가이드로 정리합니다. 후속 지원 범위는 협의합니다."],
      ].map(([label, title, description], i) => <li key={label}><div className={styles.processLabel}><span>0{i + 1} / {label}</span>{i < 2 && <ArrowRight size={20} />}</div><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

      <section id="resources" className={styles.resources} aria-labelledby="resources-heading"><div className={styles.sectionHeading}><div><span className={styles.eyebrow}>05 / OPEN RESOURCES</span><h2 id="resources-heading">오늘의 업무부터, 한 걸음 더.</h2></div><p>실무에서 바로 꺼내 쓰는 지식과 도구.<br />필요한 정보를 찾아보세요.</p></div><a className={styles.resourceCta} href="https://huddling.ai/">실무자료실에서 검색하기 <ArrowUpRight size={19} /></a><div className={styles.resourceList}>{resources.map(([title, description, href]) => <a key={href} href={`https://huddling.ai${href}`}><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={20} /></a>)}</div><div className={styles.community}><p>함께 배우고 실험하는 동료가 필요하다면</p><a href="https://huddling.club/">허들링 클럽 둘러보기 <ArrowUpRight size={17} /></a></div></section>

      <section id="contact" className={styles.contact} aria-labelledby="contact-heading"><span className={styles.eyebrow}>LET’S WORK BETTER, TOGETHER</span><h2 id="contact-heading">우리 팀의 일하는 방식,<br />어디부터 바꿔볼까요?</h2><p>지금 겪고 있는 업무의 어려움을 들려주세요.<br />팀에 맞는 교육과 컨설팅의 방향을 함께 찾겠습니다.</p><a href={contactHref} className={styles.contactButton}>교육·컨설팅 문의하기 <ArrowUpRight size={21} /></a><div className={styles.contactNote}><span>참여 직군 · 개선하고 싶은 업무 · 희망 일정</span><span>위 내용을 함께 보내주시면 구체적으로 논의할 수 있습니다.</span></div><a className={styles.email} href="mailto:yiseo@figmatutor.info">yiseo@figmatutor.info</a></section>
      <footer className={styles.footer}><Link href="/">Figmatutor<span>더 나은 일의 흐름을 함께 만듭니다.</span></Link><div><a href="https://huddling.ai/privacy">개인정보처리방침</a><a href="https://huddling.ai/terms">이용약관</a><a href="https://huddling.ai/copyright">저작권 정책</a><span>© Figmatutor</span></div></footer>
    </div>
  );
}
