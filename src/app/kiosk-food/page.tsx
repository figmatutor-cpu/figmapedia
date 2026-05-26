import type { Metadata } from "next";
import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { KioskMasonryLayout } from "@/components/section/KioskMasonryLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";
import { getCachedSectionData } from "@/lib/section-data-cache";

const navItem = NAV_ITEMS.find((n) => n.key === "kiosk-food")!;

export const metadata: Metadata = {
  title: "키오스크 스크린샷 | Figmapedia",
  description: SECTION_DESCRIPTIONS["kiosk-food"],
  alternates: { canonical: "/kiosk-food" },
  openGraph: {
    title: "키오스크 스크린샷 | Figmapedia",
    description: SECTION_DESCRIPTIONS["kiosk-food"],
    type: "website",
  },
};

export default async function KioskFoodPage() {
  let initialSectionItems;
  try {
    const allData = await getCachedSectionData();
    initialSectionItems = allData.kiosk ?? [];
  } catch (error) {
    console.error("Server-side fetch failed, falling back to client:", error);
  }

  return (
    <>
      {/* Desktop (>= xl-nav): Masonry */}
      <div className="hidden xl-nav:block">
        <KioskMasonryLayout
          title={navItem.label}
          description={SECTION_DESCRIPTIONS["kiosk-food"]}
          eyebrow="키오스크 갤러리"
          heroTitle={
            <>
              실제 운영 중인
              <br />
              키오스크 110+ 화면
            </>
          }
          subTabs={navItem.subTabs}
          initialSectionItems={initialSectionItems ?? []}
        />
      </div>

      {/* Mobile (< xl-nav): 기존 그리드 */}
      <div className="xl-nav:hidden">
        <SectionPageLayout
          title={navItem.label}
          description={SECTION_DESCRIPTIONS["kiosk-food"]}
          sectionDataKey={navItem.sectionDataKey}
          subTabs={navItem.subTabs}
          showThumbnail
          cardLayout="grid"
          initialSectionItems={initialSectionItems}
        />
      </div>
    </>
  );
}
