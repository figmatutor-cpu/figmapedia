"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const pathname = usePathname();
  if (pathname === "/" || (pathname === "/education/ai-workflow" || pathname === "/education/figma-design-system")) return null;
  return <Footer />;
}
