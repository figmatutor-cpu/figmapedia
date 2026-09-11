import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://figmatutor.info/", changeFrequency: "monthly", priority: 1 }, { url: "https://figmatutor.info/education/ai-workflow", changeFrequency: "monthly", priority: 0.8 }, { url: "https://figmatutor.info/education/figma-design-system", changeFrequency: "monthly", priority: 0.8 }, { url: "https://figmatutor.info/education/team-collaboration", changeFrequency: "monthly", priority: 0.8 }];
}
