import Link from "next/link";

const SECTIONS = [
  {
    title: "피그마 용어",
    description: "베리어블, 컴포넌트, 오토 레이아웃 등 한국어 용어사전",
    href: "/figma-info?tab=figma-glossary",
  },
  {
    title: "피그마 단축키",
    description: "Mac / Windows 피그마 단축키 모음",
    href: "/figma-info?tab=mac-shortcuts",
  },
  {
    title: "플러그인 추천",
    description: "실무에서 자주 쓰는 피그마 플러그인",
    href: "/figma-info?tab=plugins",
  },
  {
    title: "프롬프트 피디아",
    description: "AI 디자인용 한국어/영문 프롬프트 모음",
    href: "/prompt-pedia",
  },
  {
    title: "디자인 리소스",
    description: "템플릿, 튜토리얼, Figma A to Z",
    href: "/figma-resource",
  },
  {
    title: "UX/UI 스터디",
    description: "디자인 아티클, 기술 블로그, UX/UI 용어",
    href: "/uxui-study",
  },
];

export function HomeSections() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
          무엇을 찾으세요?
        </h2>
        <p className="text-sm sm:text-base text-gray-400">
          피그마와 UX/UI 실무에 필요한 정보를 카테고리별로 확인하세요.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <h3 className="text-base font-semibold text-white mb-2">
              {section.title}
            </h3>
            <p className="text-sm text-gray-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
