import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";
import { getCachedSectionData } from "@/lib/section-data-cache";

const navItem = NAV_ITEMS.find((n) => n.key === "prompt-pedia")!;

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
