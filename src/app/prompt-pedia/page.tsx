"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";
import { SECTION_DESCRIPTIONS } from "@/lib/constants";

const navItem = NAV_ITEMS.find((n) => n.key === "prompt-pedia")!;

export default function PromptPediaPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description={SECTION_DESCRIPTIONS["prompt-pedia"]}
      sectionDataKey={navItem.sectionDataKey}
      subTabs={navItem.subTabs}
      showThumbnail
      cardLayout="grid"
    />
  );
}
