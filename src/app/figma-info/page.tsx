"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";

const navItem = NAV_ITEMS.find((n) => n.key === "figma-info")!;

export default function FigmaInfoPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["figma-info"]}
      subTabs={navItem.subTabs}
      defaultFilter={navItem.defaultFilter}
    />
  );
}
