"use client";

import { useState, useEffect } from "react";
import type { SearchIndexItem } from "@/types";

type SectionKey = "prompt" | "kiosk" | "uxui-articles" | "uxui-blogs" | "uxui-terms";

/**
 * Fetches data from a separate Notion database for a specific section.
 * Used by 프롬프트, 키오스크, UXUI디자인 pages which have their own databases.
 */
export function useSectionData(section: SectionKey) {
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/section-data?section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  }, [section]);

  return { items, isLoading };
}

/**
 * Fetches data from multiple section databases and combines them.
 * Used by UXUI디자인 page which aggregates 3 separate databases.
 */
export function useMultiSectionData(sections: SectionKey[]) {
  const [items, setItems] = useState<Record<SectionKey, SearchIndexItem[]>>(
    {} as Record<SectionKey, SearchIndexItem[]>
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      sections.map((section) =>
        fetch(`/api/section-data?section=${section}`)
          .then((res) => res.json())
          .then((data) => ({
            section,
            items: data.items && Array.isArray(data.items) ? data.items : [],
          }))
          .catch(() => ({ section, items: [] as SearchIndexItem[] }))
      )
    ).then((results) => {
      const combined = {} as Record<SectionKey, SearchIndexItem[]>;
      for (const r of results) {
        combined[r.section] = r.items;
      }
      setItems(combined);
      setIsLoading(false);
    });
  }, [sections.join(",")]);

  return { items, isLoading };
}
