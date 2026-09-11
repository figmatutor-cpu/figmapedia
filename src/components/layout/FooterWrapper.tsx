"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/education/ai-workflow") return null;
  return <Footer />;
}
