import type { MetadataRoute } from "next";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import { getPublishedIssues } from "@/lib/ai-report";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://huddling.ai"
).trim();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/figma-info`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/prompt-pedia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/kiosk-food`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/uxui-study`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/figma-resource`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ai-report`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/copyright`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // 동적 엔트리 페이지 — 내부 렌더링되는 모든 섹션 포함
  // (UXUI 아티클/기술 블로그/피그마 리소스는 외부 링크라 아래 !item.link 필터로 자동 제외됨)
  const SITEMAP_SECTIONS = new Set([
    "피그마 Q&A",
    "플러그인",
    "Mac 단축키",
    "Win 단축키",
    "피그마 용어",
    "프롬프트",
    "키오스크",
    "UXUI 용어",
  ]);

  // AI리포트 — 발행된 호만 (미발행 호는 getPublishedIssues에서 제외됨)
  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const reports = await getPublishedIssues();
    reportPages = reports.map((report) => ({
      url: `${SITE_URL}/ai-report/${report.issue}`,
      lastModified: new Date(report.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: failed to fetch AI reports", error);
  }

  let entryPages: MetadataRoute.Sitemap = [];
  try {
    const { items } = await getCachedSearchIndex();
    entryPages = items
      .filter(
        (item) =>
          item.section && SITEMAP_SECTIONS.has(item.section) && !item.link,
      )
      .map((item) => ({
        url: `${SITE_URL}/entry/${item.id}`,
        lastModified: item.lastEditedTime
          ? new Date(item.lastEditedTime)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: item.section === "피그마 Q&A" ? 0.6 : 0.5,
      }));
  } catch (error) {
    console.error("Sitemap: failed to fetch entries", error);
  }

  return [...staticPages, ...entryPages, ...reportPages];
}
