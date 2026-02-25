import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";
import { getCachedSearchIndex } from "@/lib/search-index-cache";
import { getCachedSectionData } from "@/lib/section-data-cache";

const navItem = NAV_ITEMS.find((n) => n.key === "figma-info")!;

export default async function FigmaInfoPage() {
  let initialMainItems;
  let initialMultiSectionData;

  try {
    const [searchIndex, allSectionData] = await Promise.all([
      getCachedSearchIndex(),
      getCachedSectionData(),
    ]);
    initialMainItems = searchIndex.items;
    initialMultiSectionData = {
      "mac-shortcuts": allSectionData["mac-shortcuts"] ?? [],
      "win-shortcuts": allSectionData["win-shortcuts"] ?? [],
      plugins: allSectionData.plugins ?? [],
    };
  } catch (error) {
    console.error("Server-side fetch failed, falling back to client:", error);
  }

  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["figma-info"]}
      subTabs={navItem.subTabs}
      defaultFilter={navItem.defaultFilter}
      initialMainItems={initialMainItems}
      initialMultiSectionData={initialMultiSectionData}
    />
  );
}
