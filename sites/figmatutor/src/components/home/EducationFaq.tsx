import Link from "next/link";
import { educationFaqs } from "./education-content";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";

export function EducationFaq() {
  return (
    <section id="faq" className={styles.faq} aria-labelledby="faq-heading">
      <div className={styles.sectionHeading}>
        <h2 id="faq-heading">AI 교육, 자주 묻는 질문<TitlePeriod /></h2>
        <p>강사 선택부터 실습 범위까지.<br />우리 팀에 맞는 교육을 확인하세요.</p>
      </div>
      <div className={styles.faqList}>
        {educationFaqs.map(({ question, answer, href, linkLabel }) => (
          <article className={styles.faqItem} key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
            {href && <Link href={href}>{linkLabel}</Link>}
          </article>
        ))}
      </div>
    </section>
  );
}
