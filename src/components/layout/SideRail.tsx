"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  Sparkles,
  BookOpen,
  Terminal,
  LayoutGrid,
  MessageSquare,
  Hash,
  Download,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";
import { useSearchContext } from "@/components/search/SearchProvider";

interface RailItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const RAIL_ITEMS: RailItem[] = [
  { key: "ai-lab", label: "홈", href: "/ai-lab", icon: FlaskConical },
  { key: "ai-search", label: "AI 검색", href: "/", icon: Sparkles },
  {
    key: "figma-info",
    label: "피그마 정보",
    href: "/figma-info",
    icon: BookOpen,
  },
  {
    key: "prompt-pedia",
    label: "프롬프트",
    href: "/prompt-pedia",
    icon: Terminal,
  },
  {
    key: "kiosk-food",
    label: "키오스크",
    href: "/kiosk-food",
    icon: LayoutGrid,
  },
  {
    key: "community",
    label: "커뮤니티",
    href: "/community",
    icon: MessageSquare,
  },
  { key: "uxui-study", label: "UXUI", href: "/uxui-study", icon: Hash },
  {
    key: "figma-resource",
    label: "리소스",
    href: "/figma-resource",
    icon: Download,
  },
];

export function SideRail() {
  const pathname = usePathname();
  const { toggleSearch } = useSearchContext();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="hidden xl-nav:flex sticky top-0 self-start
                 h-screen w-[76px] py-4
                 flex-col items-center gap-1
                 border-r border-border-1
                 bg-bg-base z-40"
    >
      <Link
        href="/"
        className="w-11 h-11 rounded-xl mb-3
                   flex items-center justify-center
                   bg-[var(--fp-brand-blue)] text-fg-1
                   font-bold text-h3 tracking-tight
                   hover:opacity-90 transition-opacity"
        aria-label="Figmapedia 홈"
      >
        F
      </Link>

      <nav className="flex flex-col items-center gap-1 flex-1">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative w-14 py-2.5 rounded-xl
                          flex flex-col items-center gap-1
                          text-[10px] font-medium tracking-tight
                          transition-colors duration-200
                          ${
                            active
                              ? "bg-glass-3 text-fg-1"
                              : "text-fg-4 hover:text-fg-2 hover:bg-glass-1"
                          }`}
              title={item.label}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              <span className="leading-none">{item.label}</span>
              {item.badge && (
                <span
                  className="absolute top-1 right-1.5
                             px-1 py-px text-[8px] font-bold leading-none
                             rounded-full text-fg-1
                             bg-[var(--fp-brand-blue)]
                             tracking-wider"
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 mt-auto pt-2">
        <button
          type="button"
          onClick={toggleSearch}
          className="w-11 h-11 rounded-xl
                     flex items-center justify-center
                     text-fg-3 hover:text-fg-1 hover:bg-glass-2
                     border border-border-1
                     transition-colors"
          aria-label="검색 열기"
        >
          <Search size={18} strokeWidth={1.75} />
        </button>
        <Link
          href="/auth/login"
          className="w-11 h-11 rounded-xl
                     flex items-center justify-center
                     text-fg-3 hover:text-fg-1 hover:bg-glass-2
                     border border-border-1
                     transition-colors"
          aria-label="로그인"
        >
          <User size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </aside>
  );
}
