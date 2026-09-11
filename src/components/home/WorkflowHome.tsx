"use client";

import Link from "next/link";
import { programs } from "./programs";
import { Approach } from "./Approach";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { EducationFaq } from "./EducationFaq";
import { Hero } from "./Hero";
import { LectureHistory } from "./LectureHistory";
import history from "@/data/lectures.json";
import { Footer } from "./Footer";
import { CONTACT_URL } from "./contact";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";


const resources = [
  ["AI & Figma 실무 팁", "막히는 작업에서 바로 찾아보는 Q&A", "/figma-info"],
  ["프롬프트 피디아", "업무에 맞게 바꿔 쓰는 프롬프트", "/prompt-pedia"],
  ["디자인 리소스", "템플릿과 튜토리얼로 시작하는 실습", "/figma-resource"],
  ["UX/UI 스터디", "설계의 근거를 넓히는 아티클과 용어", "/uxui-study"],
  ["AI 리포트", "실무에 연결해 읽는 AI 소식", "/ai-report"],
  ["키오스크 레퍼런스", "실제 사용 맥락을 살펴보는 화면 사례", "/kiosk-food"],
];

export function WorkflowHome() {
  return (
    <div className={styles.home}>
      <Hero />

      <div className={styles.clientStrip}><p>삼성SDS · 카카오 · NHN · 현대자동차 · 카카오뱅크 등<br /><strong>{history.lectures.length}개 조직의 강의 진행 이력</strong></p><a href="#experience">강의·자문 이력 보기 <ArrowDown size={16} /></a></div>

      <Approach />

      <section id="programs" className={styles.programs} aria-labelledby="programs-heading">
        <div className={styles.sectionHeading}><div><h2 id="programs-heading">디자이너와 IT 팀을 위한<span className={styles.programTitleBreak}> </span>실무 맞춤<span className={styles.desktopTitleSpace}> </span>교육<TitlePeriod /></h2></div><p>우리 팀의 실제 업무로 배우고,<br />현업에 적용할 AI 워크플로우를 만듭니다.</p></div>
        <div>{programs.map(program => <article className={styles.program} key={program.number}><span className={styles.programNumber}>{program.number}</span><div><span className={styles.topic}>{program.topic}</span><h3>{program.href ? <Link className={styles.programTitleLink} href={program.href}>{program.title}<ArrowUpRight size={21} aria-hidden="true" /></Link> : program.title}</h3><p>{program.description}</p></div><div className={styles.programDetails}><span>함께하는 대상</span><p>{program.audience}</p><span>함께 만들 결과물</span><p>{program.output}</p><a href={CONTACT_URL}>이 주제로 문의하기 <ArrowUpRight size={16} /></a></div></article>)}</div>
      </section>

      <LectureHistory />

      <section className={styles.process} aria-labelledby="process-heading"><div className={styles.sectionHeading}><div><h2 id="process-heading">배운 다음 날에도<br />이어지는 변화<TitlePeriod /></h2></div><p>한 번의 강의부터 팀 단위 컨설팅까지.<br />필요한 깊이에 맞춰 함께합니다.</p></div><ol className={styles.processSteps}>{[
        ["진단", "지금의 업무를 이해합니다", "참여 직군, 사용하는 도구, 반복되는 작업과 협업의 어려움을 살펴봅니다."],
        ["설계와 교육", "우리 팀의 사례로 배웁니다", "실제 과제를 바탕으로 커리큘럼을 구성하고, 적용 방법을 함께 실습합니다."],
        ["적용과 정리", "계속 쓸 수 있게 남깁니다", "실습 결과를 검토하고 템플릿과 가이드로 정리합니다. 후속 지원 범위는 협의합니다."],
      ].map(([label, title, description], i) => <li key={label}><div className={styles.processLabel}><span>0{i + 1} / {label}</span>{i < 2 && <ArrowRight size={20} />}</div><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

      <section id="resources" className={styles.resources} aria-labelledby="resources-heading"><div className={styles.sectionHeading}><div><h2 id="resources-heading">오늘의 업무부터, 한 걸음 더<TitlePeriod /></h2></div><p>실무에서 바로 꺼내 쓰는 지식과 도구.<br />필요한 정보를 찾아보세요.</p></div><a className={styles.resourceCta} href="https://huddling.ai/">실무자료실에서 검색하기 <ArrowUpRight size={19} /></a><div className={styles.resourceList}>{resources.map(([title, description, href]) => <a key={href} href={`https://huddling.ai${href}`}><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={20} /></a>)}</div><div className={styles.community}><p>함께 배우고 실험하는 동료가 필요하다면</p><a href="https://huddling.club/">허들링 클럽 둘러보기 <ArrowUpRight size={17} /></a></div></section>

      <EducationFaq />

      <section id="contact" className={styles.contact} aria-labelledby="contact-heading"><h2 id="contact-heading">진짜 일을 잘 하는 팀은<br />늘 더 잘하는 방법을 고민합니다<TitlePeriod /></h2><p>지금 겪고 있는 업무의 어려움을 들려주세요.<br />팀에 맞는 교육과 컨설팅의 방향을 함께 찾겠습니다.</p><a href={CONTACT_URL} className={styles.contactButton}>교육·컨설팅 문의하기 <ArrowUpRight size={21} /></a><div className={styles.contactNote}><span>참여 직군 · 개선하고 싶은 업무 · 희망 일정</span><span>문의 폼에 남겨주시면 구체적으로 논의할 수 있습니다.</span></div><a className={styles.email} href="mailto:yiseo@figmatutor.info">yiseo@figmatutor.info</a></section>
      <Footer />
    </div>
  );
}
