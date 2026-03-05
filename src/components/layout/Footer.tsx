import Link from "next/link";

const TEAM_MEMBERS = [
  {
    name: "figma_tutor",
    img: "/images/team/figma_tutor.png",
    href: "https://www.instagram.com/figma_tutor/",
    imgClass: "absolute inset-0 max-w-none object-cover size-full",
  },
  {
    name: "kimdae_1_",
    img: "/images/team/kimdae_1_.png",
    href: "https://www.instagram.com/kimdae_1_/",
    imgClass: "absolute inset-0 max-w-none object-cover size-full",
  },
  {
    name: "bibibi.designer",
    img: "/images/team/bibibi_designer.png",
    href: "https://www.instagram.com/bibibi.designer/",
    imgClass: "absolute inset-0 max-w-none object-cover size-full",
  },
  {
    name: "siwon.designer",
    img: "/images/team/siwon_designer.png",
    href: "https://www.instagram.com/siwon.designer/",
    imgClass: "absolute inset-0 max-w-none object-cover size-full",
  },
];

function Divider() {
  return <span className="w-px h-2.5 bg-white/15 shrink-0" />;
}

export function Footer() {
  return (
    <footer id="site-footer" className="bg-bg-base border-t border-white/5">
      <div className="mx-auto max-w-7xl px-8 md:px-12 py-10 md:py-12">
        <div className="flex flex-col gap-8 md:gap-10">
          {/* 로고 */}
          <p className="font-bold text-xl text-white tracking-tight">
            Figma pedia
          </p>

          {/* 링크 + 카피라이트 + 연락처 + 아바타 */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* 좌측: 텍스트 정보 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-xs">
                <Link href="/privacy" className="text-[#6C79FF] hover:underline">개인정보처리방침</Link>
                <Divider />
                <Link href="/terms" className="text-[#858699] hover:text-white transition-colors">서비스 이용 약관</Link>
                <Divider />
                <Link href="/copyright" className="text-[#858699] hover:text-white transition-colors">저작권 정책</Link>
              </div>
              <p className="text-xs text-[#6B6F76] leading-relaxed">
                @Figmapedia All rights reserved
              </p>
              <p className="text-xs text-[#6B6F76]">
                문의:yiseo@figmatutor.info
              </p>
            </div>

            {/* 우측: 팀 아바타 */}
            <div className="flex items-center gap-4">
              {TEAM_MEMBERS.map((member) => (
                <a
                  key={member.name}
                  href={member.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 size-12 rounded-full bg-white/20 overflow-hidden transition-transform hover:scale-110 relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.img}
                    alt={member.name}
                    className={member.imgClass}
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
