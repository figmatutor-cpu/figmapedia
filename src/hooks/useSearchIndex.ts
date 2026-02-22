"use client";

import { useState, useEffect } from "react";
import type { SearchIndexItem, SearchIndex } from "@/types";

export function useSearchIndex() {
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/search-index")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: SearchIndex) => {
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  }, []);

  return { items, isLoading };
}
