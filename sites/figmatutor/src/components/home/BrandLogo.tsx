import Image from "next/image";

export function BrandLogo({ compact = false, priority = false }: { compact?: boolean; priority?: boolean }) {
  return <Image src="/logo.svg" alt="Highstand" width={compact ? 140 : 180} height={compact ? 26 : 33} priority={priority} />;
}
