"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/topics", label: "주제 투표" },
  { href: "/admin/vods", label: "라이브 / VOD" },
  { href: "/admin/members", label: "회원 관리" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="rounded-xl border border-border-1 bg-glass-1 p-2">
      <ul className="flex flex-wrap gap-1">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-glass-3 text-white"
                    : "text-gray-400 hover:bg-glass-1 hover:text-white"
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
