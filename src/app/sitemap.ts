import type { MetadataRoute } from "next";
import { getCachedSearchIndex } from "@/lib/search-index-cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figmapedia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/figma-info`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/prompt-pedia`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/kiosk-food`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/uxui-study`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/figma-resource`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/copyright`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // 동적 엔트리 페이지
  let entryPages: MetadataRoute.Sitemap = [];
  try {
    const { items } = await getCachedSearchIndex();
    entryPages = items
      .filter((item) => !item.link) // 외부 링크가 아닌 내부 엔트리만
      .map((item) => ({
        url: `${SITE_URL}/entry/${item.id}`,
        lastModified: item.lastEditedTime ? new Date(item.lastEditedTime) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Sitemap: failed to fetch entries", error);
  }

  return [...staticPages, ...entryPages];
}
