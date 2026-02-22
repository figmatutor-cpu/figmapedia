"use client";

import { SectionPageLayout } from "@/components/section/SectionPageLayout";
import { NAV_ITEMS } from "@/lib/navigation";

const navItem = NAV_ITEMS.find((n) => n.key === "kiosk-food")!;

export default function KioskFoodPage() {
  return (
    <SectionPageLayout
      title={navItem.label}
      description="검색해도 찾기 힘든 귀한 키오스크 스크린샷을 확인해보세요"
      sectionDataKey={navItem.sectionDataKey}
      subTabs={navItem.subTabs}
    />
  );
}
