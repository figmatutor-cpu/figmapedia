import { Globe, Instagram, Youtube } from "lucide-react";

/** 허들링 클럽 공식 채널. 순서대로 노출된다 */
const CHANNELS = [
  {
    label: "인스타그램",
    href: "https://www.instagram.com/huddlingclub/",
    Icon: Instagram,
  },
  { label: "웹사이트", href: "https://www.huddling.club/", Icon: Globe },
  {
    label: "유튜브",
    href: "https://www.youtube.com/@huddlingclub",
    Icon: Youtube,
  },
];

/** AI 리포트 목록/상세 헤더에 붙는 채널 진입 아이콘 버튼 */
export function ChannelLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="허들링 클럽 채널"
      className={`flex shrink-0 items-center gap-2 ${className}`}
    >
      {CHANNELS.map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`허들링 클럽 ${label} (새 탭)`}
          title={`허들링 클럽 ${label}`}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-colors hover:border-white hover:bg-white hover:text-bg-base"
        >
          <Icon size={18} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
