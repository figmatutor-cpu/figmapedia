"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";

const navItem = NAV_ITEMS.find((n) => n.key === "kiosk-food")!;

export default function KioskFoodPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["kiosk-food"]}
      sectionDataKey={navItem.sectionDataKey}
      subTabs={navItem.subTabs}
      showThumbnail
      cardLayout="grid"
    />
  );
}
