import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "./Footer";
import { TitlePeriod } from "./TitlePeriod";
import { CONTACT_URL } from "./contact";
import { programs } from "./programs";
import styles from "./ai-workflow-course.module.css";

const program = programs[2];
const modules = [
  {
    title: "팀의 맥락을 기억하는 에이전트 만들기",
    description: "반복되는 질문, 서로 다른 업무 맥락, 담당자가 없을 때 멈추는 작업을 살펴봅니다. 우리 조직의 규칙과 업무 맥락을 기억하는 팀 전용 AI 에이전트를 설정하고, 계속 실행할 수 있는 환경을 준비합니다.",
    practice: [
      "팀의 협업에서 반복되는 질문과 병목 구간 정리",
      "VPS 서버 준비와 Cursor의 SSH 연결",
      "Hermes Agent 설치와 사용하는 LLM 연결",
      "SOUL.md·AGENTS.md와 메모리·스킬의 역할 이해 및 팀 기준 설정",
    ],
    output: "팀의 업무 맥락과 실행 규칙을 반영한 AI 에이전트 작업 환경",
  },
  {
    title: "Discord와 Obsidian으로 하나의 소통 창구 만들기",
    description: "개인이 가진 정보를 팀이 함께 활용할 수 있도록 연결합니다. Discord에서 에이전트와 대화하고, Obsidian에 팀의 지식을 정리하며, GitHub로 변경 내용을 공유하는 흐름을 만듭니다.",
    practice: [
      "Discord 봇 생성과 Hermes Agent 연결",
      "Obsidian 볼트 생성과 팀의 지식 저장 구조 설정",
      "에이전트가 참고할 볼트 사용 규칙 작성",
      "GitHub를 통한 양방향 동기화와 봇의 지식 조회 확인",
    ],
    output: "팀이 함께 사용하는 Discord 봇과 Obsidian 지식 저장소, GitHub 동기화 흐름",
  },
  {
    title: "메일·일정·회의록을 실제 협업 흐름으로 연결하기",
    description: "팀이 이미 사용하는 도구를 연결해 대화가 다음 업무로 이어지도록 만듭니다. 회의 기록을 요약하고 지식 저장소에 남긴 뒤, 다음 회의 안건과 액션 아이템으로 이어지는 과정을 실습합니다.",
    practice: [
      "Gmail·Google Calendar·Fireflies 연결",
      "Discord 봇을 통한 일정 예약과 회의록·액션 아이템 확인",
      "Fireflies 회의 기록 → 봇의 요약 보고 → Obsidian 저장 흐름 구성",
      "저장된 회의록을 바탕으로 다음 회의 안건 도출",
      "우리 팀의 병목 구간에 맞춰 협업 워크플로우 적용",
    ],
    output: "회의 기록·요약·지식 저장·다음 안건으로 이어지는 팀 협업 워크플로우",
  },
];

export function TeamCollaborationCourse() {
  return <>
    <article className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.back} href="/#programs"><ArrowLeft size={16} aria-hidden="true" />교육 프로그램</Link>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>기업 AI 교육 · 팀 지식 공유 · 협업 자동화</p>
          <h1>AI로 연결하는<br />팀의 협업 흐름<TitlePeriod /></h1>
        </header>
        <figure className={styles.figure}>
          <Image src="/images/education/team-collaboration.png" alt="팀의 협업 문제, 맥락을 기억하는 Hermes Agent, Discord 봇과 Obsidian 지식 저장소의 연결을 소개하는 강의 슬라이드 5장" width={1358} height={688} priority sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 80px), 1120px" />
          <figcaption>강의 자료 미리보기 · 팀의 맥락을 기억하고 지식을 공유하는 AI 협업 환경</figcaption>
        </figure>
        <div className={styles.introduction}>
          <p className={styles.lead}>각자의 AI 활용을,<br />팀이 함께 일하는 방식으로.</p>
          <p>{program.description}</p>
        </div>
        <section aria-labelledby="curriculum-heading">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>에이전트 설정부터 업무 도구 연결까지</p><h2 id="curriculum-heading">기본 커리큘럼<TitlePeriod /></h2></div>
            <p>팀 전용 에이전트 → 지식 공유 → 업무 도구 연결.<br />세 단계로 협업 환경을 만듭니다.</p>
          </div>
          <ol className={styles.modules}>
            {modules.map((module, index) => <li key={module.title} className={styles.module}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <ul>{module.practice.map(item => <li key={item}>{item}</li>)}</ul>
                <p className={styles.tools}><strong>실습 결과물</strong><br />{module.output}</p>
              </div>
            </li>)}
          </ol>
          <p className={styles.note}>팀이 사용하는 도구와 계정 환경, 참여자의 숙련도에 맞춰 교육 시간과 실습 범위를 함께 정합니다.</p>
        </section>
        <section className={styles.outcomes} aria-labelledby="audience-heading">
          <div><h2 id="audience-heading">함께하는 대상</h2><p>{program.audience}</p></div>
          <div><h2>함께 만들 결과물</h2><p>{program.output}</p></div>
        </section>
      </div>
      <section className={styles.contact} aria-labelledby="course-contact-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>반복되는 질문과 멈추는 업무에서 시작하세요</p>
          <h2 id="course-contact-heading">우리 팀의 지식이<br />다음 업무로 이어지도록<TitlePeriod /></h2>
          <p>팀에서 사용하는 도구와 협업 중 막히는 지점을 알려주세요.<br />함께 활용할 AI 작업 환경과 교육 범위를 설계하겠습니다.</p>
          <a href={CONTACT_URL}>이 주제로 문의하기</a>
        </div>
      </section>
    </article>
    <Footer />
  </>;
}
