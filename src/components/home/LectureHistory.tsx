"use client";

import { useState } from "react";
import { ArrowDown, Search } from "lucide-react";
import history from "@/data/lectures.json";
import styles from "./lecture-history.module.css";

const categories = ["전체", ...new Set(history.lectures.map(lecture => lecture.category))];
const featuredNames = ["NHN", "카카오", "삼성SDS", "우아한형제들 (배달의민족)"];
const featured = featuredNames.map(name => history.lectures.find(lecture => lecture.organization === name)!);
const consulting = history.lectures.find(lecture => lecture.organization === "더워터멜론")!;

export function LectureHistory() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const filtered = history.lectures.filter(lecture =>
    (category === "전체" || lecture.category === category) &&
    lecture.organization.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return <section id="experience" className={styles.section} aria-labelledby="experience-heading">
    <div className={styles.heading}><div><span className={styles.eyebrow}>03 / TEACHING EXPERIENCE</span><h2 id="experience-heading">다양한 조직의 현장에서<br />쌓아온 교육 경험.</h2></div><p>기업과 플랫폼, 대학과 공공기관까지.<br />2022년부터 이어온 강의와 자문 이력을 소개합니다.</p></div>
    <div className={styles.selected}><div className={styles.selectedIntro}><h3>여러 차례 이어진 교육</h3><p>한 조직에서 반복해 진행한<br />주요 강의 이력입니다.</p></div><div className={styles.repeatList}>{featured.map(lecture => <div key={lecture.organization}><strong>{lecture.organization}</strong><span>{lecture.period}</span><span className={styles.frequency}>{lecture.frequency.replace(" (최다)", "")}</span></div>)}</div></div>
    <div className={styles.advisory}><h3>컨설팅과 교육 자문</h3><div><p><strong>{consulting.organization}</strong><span>{consulting.period} · 컨설팅 1회</span></p>{history.advisory.map(item => <p key={item.organization}><strong>{item.organization}</strong><span>{item.period} · {item.description}</span></p>)}</div></div>
    <details className={styles.archive}>
      <summary><span>전체 강의 이력 살펴보기 <small>{history.lectures.length}개 조직 기록</small></span><ArrowDown size={19} /></summary>
      <div className={styles.archiveBody}>
        <div className={styles.filters} role="group" aria-label="강의 이력 분야 필터">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className={styles.searchRow}><label className={styles.search}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>조직명으로 강의 이력 검색</span><input type="search" placeholder="조직명으로 찾아보기" value={query} onChange={event => setQuery(event.target.value)} /></label><p role="status" aria-live="polite">{filtered.length}개 기록</p></div>
        <ul className={styles.records}>{filtered.map(lecture => <li key={lecture.organization}><div><strong>{lecture.organization}</strong><span>{lecture.category}</span></div><span>{lecture.period === "미상" ? "시기 미기재" : lecture.period}</span><span>{lecture.frequency.replace(" (최다)", "")}</span></li>)}</ul>
        {filtered.length === 0 && <div className={styles.empty}><p>조건에 맞는 강의 이력이 없습니다.</p><button type="button" onClick={() => { setCategory("전체"); setQuery(""); }}>전체 이력 보기</button></div>}
        <p className={styles.note}>조직별로 정리한 이력입니다. 횟수와 과정 표기는 진행 형태에 따라 다르며, 전체 강의 횟수를 의미하지 않습니다.</p>
      </div>
    </details>
  </section>;
}
