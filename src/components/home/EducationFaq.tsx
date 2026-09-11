"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { educationFaqs } from "./education-content";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./workflow-home.module.css";

export function EducationFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const id = useId();
  return (
    <section id="faq" className={styles.faq} aria-labelledby="faq-heading">
      <div className={styles.sectionHeading}>
        <h2 id="faq-heading">AI 교육, 자주 묻는 질문<TitlePeriod /></h2>
        <p>교육 진행부터 실습 범위까지.<br />우리 팀에 맞는 교육을 확인하세요.</p>
      </div>
      <div className={styles.faqList}>
        {educationFaqs.map(({ question, answer, href, linkLabel }, index) => {
          const isOpen = openIndex === index;
          const triggerId = `${id}-question-${index}`;
          const panelId = `${id}-answer-${index}`;

          return (
            <article className={styles.faqItem} key={question}>
              <h3>
                <button
                  id={triggerId}
                  className={styles.faqTrigger}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(current => current === index ? null : index)}
                >
                  <span>{question}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} className={styles.faqPanel} role="region" aria-labelledby={triggerId} hidden={!isOpen}>
                <p>{answer}</p>
                {href && <Link href={href}>{linkLabel}</Link>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
