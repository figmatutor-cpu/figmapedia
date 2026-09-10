"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import styles from "./home-navigation.module.css";

const links = [["접근 방식", "#approach"], ["교육·컨설팅", "#programs"], ["강의 이력", "#experience"], ["실무자료실", "https://huddling.ai/"], ["커뮤니티", "https://huddling.club/"]];

export function HomeNavigation() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("home-menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <header className={styles.header}>
    <a className={styles.skip} href="#main-content">본문으로 건너뛰기</a>
    <div className={styles.row}><Link className={styles.logo} href="/" aria-label="Figmatutor 홈">Figmatutor<span>일하는 방식의 다음 단계</span></Link>
      <nav aria-label="주 메뉴" className={styles.desktop}>{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <a className={styles.contact} href="#contact">문의하기 <ArrowUpRight size={16} /></a>
      <button id="home-menu-toggle" className={styles.toggle} aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="home-mobile-nav" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    <nav id="home-mobile-nav" aria-label="모바일 주 메뉴" className={styles.mobile} hidden={!open}>{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={17} /></a>)}<a href="#contact" onClick={() => setOpen(false)}>교육·컨설팅 문의<ArrowUpRight size={17} /></a></nav>
  </header>;
}
