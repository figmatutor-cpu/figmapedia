import Image from "next/image";

const links = [
  { label: "인스타그램", href: "https://www.instagram.com/figma_tutor", icon: "instagram" },
  { label: "유튜브", href: "https://www.youtube.com/@figma_tutor", icon: "youtube" },
  { label: "쓰레드", href: "https://www.threads.com/@figma_tutor", icon: "threads" },
  { label: "링크드인", href: "https://www.linkedin.com/in/figmatutor", icon: "linkedin" },
];

export function SocialLinks({ className }: { className: string }) {
  return <nav className={className} aria-label="SNS 링크">
    {links.map(({ label, href, icon }) => (
      <a key={icon} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (새 탭)`}>
        <Image src={`/images/footer/${icon}.svg`} alt="" width={40} height={40} />
      </a>
    ))}
  </nav>;
}
