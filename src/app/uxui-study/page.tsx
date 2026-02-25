import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";
import { getCachedSectionData } from "@/lib/section-data-cache";

const navItem = NAV_ITEMS.find((n) => n.key === "uxui-study")!;

export default async function UXUIStudyPage() {
  let initialMultiSectionData;
  try {
    const allData = await getCachedSectionData();
    initialMultiSectionData = {
      "uxui-articles": allData["uxui-articles"] ?? [],
      "uxui-blogs": allData["uxui-blogs"] ?? [],
      "uxui-terms": allData["uxui-terms"] ?? [],
    };
  } catch (error) {
    console.error("Server-side fetch failed, falling back to client:", error);
  }

  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["uxui-study"]}
      subTabs={navItem.subTabs}
      showThumbnail
      cardLayout="grid"
      initialMultiSectionData={initialMultiSectionData}
    />
  );
}
