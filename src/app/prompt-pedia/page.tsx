"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";

const navItem = NAV_ITEMS.find((n) => n.key === "prompt-pedia")!;

export default function PromptPediaPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description="좋은 아웃풋을 얻을 수 있는 프롬프트를 확인해보세요"
      sectionDataKey={navItem.sectionDataKey}
      subTabs={navItem.subTabs}
    />
  );
}
