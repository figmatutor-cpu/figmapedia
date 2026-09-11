import Image from "next/image";

export function BrandLogo({ compact = false, priority = false }: { compact?: boolean; priority?: boolean }) {
  return <Image src="/gnb-logo.svg" alt="FigmaTutor" width={compact ? 140 : 180} height={compact ? 38.4 : 49.4} priority={priority} />;
}
