import { HomeNavigation } from "@/components/home/HomeNavigation";
import { FigmaDesignSystemCourse } from "@/components/home/FigmaDesignSystemCourse";
export { figmaDesignSystemMetadata as metadata } from "@/components/home/figma-design-system-metadata";

export default function FigmaDesignSystemPage() {
  return <><HomeNavigation /><main id="main-content"><FigmaDesignSystemCourse /></main></>;
}
