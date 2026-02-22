"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";

const navItem = NAV_ITEMS.find((n) => n.key === "figma-info")!;

export default function FigmaInfoPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description="피그마 용어, 단축키, 플러그인 정보를 확인하세요"
      subTabs={navItem.subTabs}
      defaultFilter={navItem.defaultFilter}
    />
  );
}
