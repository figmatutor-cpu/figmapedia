"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";

const navItem = NAV_ITEMS.find((n) => n.key === "uxui-study")!;

export default function UXUIStudyPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description="UXUI 디자인 학습 리소스를 모아봤어요"
      subTabs={navItem.subTabs}
    />
  );
}
