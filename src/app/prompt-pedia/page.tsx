import type { Metadata } from "next";
import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";
import { getCachedSectionData } from "@/lib/section-data-cache";

const navItem = NAV_ITEMS.find((n) => n.key === "prompt-pedia")!;

export const metadata: Metadata = {
  title: "프롬프트 피디아 | Figmapedia",
  description: SECTION_DESCRIPTIONS["prompt-pedia"],
  alternates: { canonical: "/prompt-pedia" },
  openGraph: {
    title: "프롬프트 피디아 | Figmapedia",
    description: SECTION_DESCRIPTIONS["prompt-pedia"],
    type: "website",
  },
};

export default async function PromptPediaPage() {
  let initialSectionItems;
  try {
    const allData = await getCachedSectionData();
    initialSectionItems = allData.prompt ?? [];
  } catch (error) {
    console.error("Server-side fetch failed, falling back to client:", error);
  }

  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["prompt-pedia"]}
      sectionDataKey={navItem.sectionDataKey}
      subTabs={navItem.subTabs}
      showThumbnail
      cardLayout="grid"
      initialSectionItems={initialSectionItems}
    />
  );
}
