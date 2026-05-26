"use client";

import Link from "next/link";
import { Terminal, LayoutGrid, Hash, type LucideIcon } from "lucide-react";

export type DesignInfoTabKey = "prompt" | "kiosk" | "uxui";

interface TabDef {
  key: DesignInfoTabKey;
  label: string;
  href: string;
  icon: LucideIcon;
}

const TABS: TabDef[] = [
  { key: "prompt", label: "프롬프트", href: "/prompt-pedia", icon: Terminal },
  { key: "kiosk", label: "키오스크", href: "/kiosk-food", icon: LayoutGrid },
  { key: "uxui", label: "UXUI", href: "/uxui-study", icon: Hash },
];

interface DesignInfoTabsProps {
  current: DesignInfoTabKey;
}

export function DesignInfoTabs({ current }: DesignInfoTabsProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 xl-nav:px-10 pt-6 xl-nav:pt-8">
      <nav
        aria-label="디자인 정보 섹션 탐색"
        className="flex items-center justify-center gap-2 overflow-x-auto
                   scrollbar-none -mx-1 px-1"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === current;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 inline-flex items-center gap-1.5
                          rounded-full px-4 py-2 text-body font-medium
                          border transition-colors duration-200
                          ${
                            active
                              ? "bg-glass-3 border-border-2 text-fg-1"
                              : "bg-glass-1 border-border-1 text-fg-4 hover:bg-glass-2 hover:text-fg-2 hover:border-border-2"
                          }`}
            >
              <Icon size={14} strokeWidth={active ? 2.25 : 1.75} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
