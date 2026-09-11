"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import history from "@/data/lectures.json";
import { TitlePeriod } from "./TitlePeriod";
import styles from "./lecture-history.module.css";

const PAGE_SIZE = 10;

const categories = ["전체", ...new Set(history.lectures.map(lecture => lecture.category))];
const featuredNames = ["NHN", "카카오", "삼성SDS", "우아한형제들 (배달의민족)"];
const featured = featuredNames.map(name => history.lectures.find(lecture => lecture.organization === name)!);
const consulting = history.lectures.find(lecture => lecture.organization === "더워터멜론")!;

export function LectureHistory() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = history.lectures.filter(lecture =>
    (category === "전체" || lecture.category === category) &&
    lecture.organization.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <section id="experience" className={styles.section} aria-labelledby="experience-heading">
    <div className={styles.heading}><div><h2 id="experience-heading">{history.lectures.length}개 조직과 함께한<br />실무 교육 경험<TitlePeriod /></h2></div><p>기업과 플랫폼, 대학과 공공기관까지.<br />2022년부터 이어온 강의와 자문 이력을 소개합니다.</p></div>
    <div className={styles.selected}><div className={styles.selectedIntro}><h3>여러 차례 이어진 교육</h3><p>한 조직에서 반복해 진행한<br />주요 강의 이력입니다.</p></div><div className={styles.repeatList}>{featured.map(lecture => <div key={lecture.organization}><strong>{lecture.organization}</strong><span>{lecture.period}</span><span className={styles.frequency}>{lecture.frequency.replace(" (최다)", "")}</span></div>)}</div></div>
    <div className={styles.advisory}><h3>컨설팅과 교육 자문</h3><div><p><strong>{consulting.organization}</strong><span>{consulting.period} · 컨설팅 1회</span></p>{history.advisory.map(item => <p key={item.organization}><strong>{item.organization}</strong><span>{item.period} · {item.description}</span></p>)}</div></div>
    <div className={styles.archive}>
      <div className={styles.archiveHeading}><h3>전체 강의 이력</h3><span>{history.lectures.length}개 조직 기록</span></div>
      <div className={styles.archiveBody}>
        <div className={styles.filters} role="group" aria-label="강의 이력 분야 필터">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(1); }}>{item}</button>)}</div>
        <div className={styles.searchRow}><label className={styles.search}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>조직명으로 강의 이력 검색</span><input type="search" placeholder="조직명으로 찾아보기" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><p role="status" aria-live="polite">{filtered.length}개 기록{filtered.length > 0 && ` · ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}번째`}</p></div>
        <ul id="lecture-records" className={styles.records}>{visible.map(lecture => <li key={lecture.organization}><div><strong>{lecture.organization}</strong><span>{lecture.category}</span></div><span>{lecture.period === "미상" ? "시기 미기재" : lecture.period}</span><span>{lecture.frequency === "미상" ? "횟수 미기재" : lecture.frequency.replace(" (최다)", "")}</span></li>)}</ul>
        {filtered.length === 0 && <div className={styles.empty}><p>조건에 맞는 강의 이력이 없습니다.</p><button type="button" onClick={() => { setCategory("전체"); setQuery(""); setPage(1); }}>전체 이력 보기</button></div>}
        {pageCount > 1 && <nav className={styles.pagination} aria-label="강의 이력 페이지">
          <button type="button" aria-label="이전 페이지" aria-controls="lecture-records" disabled={page === 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={18} />이전</button>
          <span role="status" aria-live="polite" aria-atomic="true"><strong>{page}</strong> / {pageCount} 페이지</span>
          <button type="button" aria-label="다음 페이지" aria-controls="lecture-records" disabled={page === pageCount} onClick={() => setPage(current => current + 1)}>다음<ChevronRight size={18} /></button>
        </nav>}
        <p className={styles.note}>조직별로 정리한 이력입니다. 횟수와 과정 표기는 진행 형태에 따라 다르며, 전체 강의 횟수를 의미하지 않습니다.</p>
      </div>
    </div>
  </section>;
}
