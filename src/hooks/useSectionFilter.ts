"use client";

import { useMemo } from "react";
import type { SearchIndexItem } from "@/types";
import type { FilterConfig } from "@/lib/navigation";

export function filterItems(
  items: SearchIndexItem[],
  config: FilterConfig
): SearchIndexItem[] {
  return items.filter((item) => {
    const titleLower = item.title.toLowerCase();

    if (config.titleAllRequired?.length) {
      const allPresent = config.titleAllRequired.every((kw) =>
        titleLower.includes(kw.toLowerCase())
      );
      if (!allPresent) return false;
    }

    if (config.titleExclude?.length) {
      const anyExcluded = config.titleExclude.some((kw) =>
        titleLower.includes(kw.toLowerCase())
      );
      if (anyExcluded) return false;
    }

    let hasKeywordMatch = false;
    if (config.titleKeywords?.length) {
      hasKeywordMatch = config.titleKeywords.some((kw) =>
        titleLower.includes(kw.toLowerCase())
      );
    }

    let hasCategoryMatch = false;
    if (config.categoryMatch?.length) {
      hasCategoryMatch = config.categoryMatch.some((cat) =>
        item.categories.some((c) =>
          c.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (config.titleKeywords?.length || config.categoryMatch?.length) {
      return hasKeywordMatch || hasCategoryMatch;
    }

    return true;
  });
}

export function useSectionFilter(
  items: SearchIndexItem[],
  config: FilterConfig | undefined
) {
  return useMemo(() => {
    if (!config) return items;
    return filterItems(items, config);
  }, [items, config]);
}
