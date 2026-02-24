"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";

const navItem = NAV_ITEMS.find((n) => n.key === "uxui-study")!;

export default function UXUIStudyPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["uxui-study"]}
      subTabs={navItem.subTabs}
      showThumbnail
      cardLayout="grid"
    />
  );
}
