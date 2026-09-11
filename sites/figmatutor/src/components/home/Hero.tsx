"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { CONTACT_URL } from "./contact";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";

const titles = ["AI+Figma 효율화 교육", "팀 워크플로우 효율화 교육", "AI 업무 자동화 교육"];

export function Hero() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroContent}>
        <h1 id="home-heading" className={styles.heroTitle}>
          <span className={styles.srOnly}>디자이너와 IT 실무자를 위한 {titles.join(", ")}</span>
          <span aria-hidden="true" className={styles.heroLead}>디자이너와 IT 실무자를 위한 </span>
          <span aria-hidden="true" className={`${styles.heroSubjects} ${paused ? styles.paused : ""}`}>
            <span className={styles.rotatingWords}>
              {titles.map((title, index) => (
                <span key={title} className={styles.rotatingWord} style={{ animationDelay: `${-((titles.length - index) % titles.length) * 2.5}s` }}>{title}<TitlePeriod /></span>
              ))}
            </span>
          </span>
        </h1>
        <p className={styles.intro}>Figma · Claude · ChatGPT · MCP · 바이브코딩을<br className={styles.mobileBreak} /> 실무 워크플로우에 연결합니다.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={CONTACT_URL}>교육·컨설팅 문의</a>
          <a className={styles.secondary} href="#programs">교육 프로그램 살펴보기</a>
        </div>
        <button className={styles.motionToggle} type="button" aria-label={paused ? "제목 자동 전환 재생" : "제목 자동 전환 일시정지"} onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
