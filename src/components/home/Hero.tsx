import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CONTACT_URL } from "./contact";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroContent}>
        <h1 id="home-heading" className={styles.heroTitle}>
          <span className={styles.heroLead}>디자이너와 IT 실무자를 위한 </span>
          <span className={styles.heroSubjects}>AI 업무혁신 교육<TitlePeriod /></span>
        </h1>
        <p className={styles.intro}>Figma · Claude · ChatGPT · MCP · 바이브코딩을<br className={styles.mobileBreak} /> 실무 워크플로우에 연결합니다.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={CONTACT_URL}>교육·컨설팅 문의 <ArrowUpRight size={19} /></a>
          <a className={styles.secondary} href="#programs">교육 프로그램 살펴보기 <ArrowDown size={18} /></a>
        </div>
      </div>
    </section>
  );
}
