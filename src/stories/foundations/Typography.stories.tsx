import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TokenSection, useComputedStyle } from "./TokenPreview";

const SAMPLE = "피그마피디아 Figmapedia 0123456789";

const FONT_FAMILIES = [
  {
    name: "font-sans",
    className: "font-sans",
    variable: "--font-pretendard",
    usage: "기본 (한글 + 영문)",
  },
  {
    name: "font-mono",
    className: "font-mono",
    variable: "--font-geist-mono",
    usage: "코드, 단축키",
  },
];

/** 프로젝트 컴포넌트에서 실제 사용 중인 텍스트 크기 (text-xxs만 커스텀) */
const TEXT_SIZES = [
  {
    name: "text-xxs",
    className: "text-xxs",
    usage: "커스텀 — 탭 카운트, 보조 텍스트",
  },
  { name: "text-xs", className: "text-xs", usage: "배지, 메타 정보" },
  { name: "text-sm", className: "text-sm", usage: "탭, 본문 보조" },
  { name: "text-base", className: "text-base", usage: "카드 제목" },
  { name: "text-lg", className: "text-lg", usage: "섹션 제목, 빈 상태 제목" },
];

const FONT_WEIGHTS = [
  { name: "font-normal", className: "font-normal" },
  { name: "font-medium", className: "font-medium" },
  { name: "font-semibold", className: "font-semibold" },
  { name: "font-bold", className: "font-bold" },
];

function TypeRow({
  name,
  className,
  usage,
  property,
}: {
  name: string;
  className: string;
  usage?: string;
  property: "fontSize" | "fontFamily" | "fontWeight";
}) {
  const { ref, value } = useComputedStyle<HTMLParagraphElement>(property);

  return (
    <div className="flex flex-col gap-2 border-b border-white/10 py-4 sm:flex-row">
      <div className="flex flex-col gap-0.5 sm:w-44 sm:shrink-0">
        <code className="font-mono text-xs text-white">{name}</code>
        <span className="font-mono text-xxs text-gray-500 line-clamp-1">
          {value}
        </span>
        {usage && <span className="text-xs text-gray-400">{usage}</span>}
      </div>
      <p ref={ref} className={`text-gray-100 ${className}`}>
        {SAMPLE}
      </p>
    </div>
  );
}

const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pretendard Variable(기본)과 Geist Mono(코드). 커스텀 크기는 `text-xxs`(10px / 1.4) 하나이며, 나머지는 Tailwind 기본 스케일을 사용합니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FontFamily: Story = {
  render: () => (
    <TokenSection title="Font Family">
      {FONT_FAMILIES.map((f) => (
        <TypeRow
          key={f.name}
          name={f.name}
          className={f.className}
          usage={`${f.variable} · ${f.usage}`}
          property="fontFamily"
        />
      ))}
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(SAMPLE)).toHaveLength(
      FONT_FAMILIES.length,
    );
  },
};

export const FontSize: Story = {
  render: () => (
    <TokenSection title="Font Size">
      {TEXT_SIZES.map((t) => (
        <TypeRow key={t.name} {...t} property="fontSize" />
      ))}
    </TokenSection>
  ),
};

export const FontWeight: Story = {
  render: () => (
    <TokenSection
      title="Font Weight"
      description="Pretendard Variable 가변 굵기"
    >
      {FONT_WEIGHTS.map((w) => (
        <TypeRow key={w.name} {...w} property="fontWeight" />
      ))}
    </TokenSection>
  ),
};
