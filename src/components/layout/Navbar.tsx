"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { useSearchContext } from "@/components/search/SearchProvider";
import { SearchIcon } from "@/components/ui/SearchIcon";

export function Navbar() {
  const pathname = usePathname();
  const { toggleSearch, isSearchOpen } = useSearchContext();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }
    return () => {
      if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50
                   flex flex-col items-center
                   px-6 backdrop-blur-sm
                   ${headerShapeClass}
                   border border-navbar-border bg-navbar-bg
                   w-[calc(100%-2rem)] xl-nav:w-auto
                   transition-[border-radius] duration-0 ease-in-out`}
    >
      {/* Main row */}
      <div className="flex items-center justify-between w-full gap-x-6 xl-nav:gap-x-8 h-[58px]">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-semibold text-base leading-none whitespace-nowrap"
        >
          Figmapedia
        </Link>

        {/* Desktop nav — visible above xl-nav breakpoint */}
        <nav className="hidden xl-nav:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`text-sm leading-none whitespace-nowrap transition-colors hover:text-white ${
                isActive(item.href) ? "text-white" : "text-gray-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.figmapedia.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm leading-none whitespace-nowrap transition-colors text-gray-400 hover:text-white"
          >
            피그마 리소스
          </a>
        </nav>

        {/* Right-side actions: search icon + mobile hamburger */}
        {/* On home desktop: no search icon + hamburger hidden = empty div → hide entirely */}
        <div className={`flex items-center gap-2 ${isHome ? "xl-nav:hidden" : ""}`}>
          {/* Search icon — visible on non-home pages */}
          {!isHome && (
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none ${
                isSearchOpen
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={toggleSearch}
              aria-label={isSearchOpen ? "검색 닫기" : "검색 열기"}
            >
              <SearchIcon className="w-[18px] h-[18px]" />
            </button>
          )}

          {/* Mobile: hamburger — visible below xl-nav breakpoint */}
          <button
            className="xl-nav:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown — below 1200px */}
      <div
        className={`xl-nav:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                     ${isOpen ? "max-h-[1000px] opacity-100 pt-4" : "max-h-0 opacity-0 pt-0 pointer-events-none"}`}
      >
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`transition-colors w-full text-center ${
                isActive(item.href)
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.figmapedia.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors w-full text-center text-gray-300 hover:text-white"
          >
            피그마 리소스
          </a>
        </nav>
      </div>
    </header>
  );
}
