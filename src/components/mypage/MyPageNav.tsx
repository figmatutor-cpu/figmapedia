"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/mypage", label: "대시보드" },
  { href: "/mypage/billing", label: "구독 관리" },
  { href: "/mypage/activity", label: "활동 이력" },
  { href: "/mypage/badges", label: "뱃지" },
  { href: "/mypage/mentor", label: "멘토" },
];

export function MyPageNav() {
  const pathname = usePathname();
  return (
    <nav className="rounded-xl border border-border-1 bg-glass-2 p-2">
      <ul className="flex flex-wrap gap-1">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/mypage" && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-body transition ${
                  active
                    ? "bg-glass-3 text-fg-1"
                    : "text-fg-3 hover:bg-glass-1 hover:text-fg-1"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
