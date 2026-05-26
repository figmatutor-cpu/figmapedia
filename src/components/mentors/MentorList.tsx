"use client";

import { useMemo, useState } from "react";
import type { MentorWithStats } from "@/types/mentor";
import { MentorCard } from "./MentorCard";

interface Props {
  mentors: MentorWithStats[];
}

type SortKey = "rating" | "sessions" | "name";

export function MentorList({ mentors }: Props) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const specialties = useMemo(
    () => Array.from(new Set(mentors.flatMap((m) => m.specialties))).sort(),
    [mentors],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let rows = mentors;
    if (needle) {
      rows = rows.filter(
        (m) =>
          m.display_name.toLowerCase().includes(needle) ||
          m.mentor_title?.toLowerCase().includes(needle) ||
          m.specialties.some((s) => s.toLowerCase().includes(needle)),
      );
    }
    if (specialty) {
      rows = rows.filter((m) => m.specialties.includes(specialty));
    }
    const sorted = [...rows];
    if (sort === "rating") {
      sorted.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sort === "sessions") {
      sorted.sort((a, b) => b.completed_sessions - a.completed_sessions);
    } else {
      sorted.sort((a, b) =>
        a.display_name.localeCompare(b.display_name, "ko-KR"),
      );
    }
    return sorted;
  }, [mentors, query, specialty, sort]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border-1 bg-glass-2 p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 직책, 전문 분야 검색..."
            className="rounded-lg border border-border-1 bg-glass-1 px-4 py-2.5 text-body text-fg-1 placeholder:text-fg-5 focus:border-border-3 focus:outline-none"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-meta text-fg-1 focus:border-border-3 focus:outline-none"
          >
            <option value="">모든 분야</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border-1 bg-glass-1 px-3 py-2.5 text-meta text-fg-1 focus:border-border-3 focus:outline-none"
          >
            <option value="rating">평점순</option>
            <option value="sessions">세션 수 순</option>
            <option value="name">이름순</option>
          </select>
        </div>
        <div className="mt-3 text-xxs text-fg-4">{filtered.length}명</div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-10 text-center">
          <p className="text-body text-fg-3">조건에 맞는 멘토가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MentorCard key={m.id} mentor={m} />
          ))}
        </div>
      )}
    </div>
  );
}
