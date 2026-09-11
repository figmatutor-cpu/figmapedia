"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { CONTACT_URL } from "./contact";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";

const titles = ["AI+Figma 효율화 교육", "워크플로우 효율화 교육", "업무 자동화 교육"];

export function Hero() {
  const [paused, setPaused] = useState(false);

  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroContent}>
        <h1 id="home-heading" className={styles.heroTitle}>
          <span className={styles.srOnly}>실무에 바로 적용하는 AI+Figma 효율화, 워크플로우 효율화, 업무 자동화 교육</span>
          <span aria-hidden="true" className={styles.heroLead}>실무에 바로 적용하는</span>
          <span aria-hidden="true" className={`${styles.heroSubjects} ${paused ? styles.paused : ""}`}>
            <span className={styles.rotatingWords}>
              {titles.map((title, index) => (
                <span key={title} className={styles.rotatingWord} style={{ animationDelay: `${-((titles.length - index) % titles.length) * 3}s` }}>{title}<TitlePeriod /></span>
              ))}
            </span>
          </span>
        </h1>
        <p className={styles.intro}>반복 업무는 줄이고, 중요한 판단에 집중하도록.<br />여러분과 팀의 실제 업무에 맞춰 배우고, 바로 적용합니다.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={CONTACT_URL}>교육·컨설팅 문의 <ArrowUpRight size={19} /></a>
          <a className={styles.secondary} href="#programs">교육 프로그램 살펴보기 <ArrowDown size={18} /></a>
        </div>
        <button className={styles.motionToggle} type="button" aria-label={paused ? "제목 자동 전환 재생" : "제목 자동 전환 일시정지"} onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
