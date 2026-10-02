import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TokenSection } from "./TokenPreview";

/** 현재 뷰포트에서 활성화된 브레이크포인트를 실제 클래스로 표시 */
const BREAKPOINTS = [
  {
    name: "sm",
    min: "640px",
    className: "hidden sm:inline-flex",
    usage: "Tailwind 기본",
  },
  {
    name: "md",
    min: "768px",
    className: "hidden md:inline-flex",
    usage: "Tailwind 기본 · 모바일 검색 대응 기준",
  },
  {
    name: "lg",
    min: "1024px",
    className: "hidden lg:inline-flex",
    usage: "Tailwind 기본",
  },
  {
    name: "xl-nav",
    min: "1080px",
    className: "hidden xl-nav:inline-flex",
    usage: "커스텀 · 네비게이션 데스크탑/모바일, 필터 탭 전환",
  },
  {
    name: "xl",
    min: "1280px",
    className: "hidden xl:inline-flex",
    usage: "Tailwind 기본",
  },
];

const meta = {
  title: "Foundations/Breakpoints",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "툴바의 Viewport로 크기를 바꾸면 활성 배지가 실제 미디어 쿼리에 따라 전환됩니다. 커스텀 브레이크포인트는 `xl-nav` 하나입니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <TokenSection title="Breakpoints">
      <div className="flex flex-col">
        {BREAKPOINTS.map((bp) => (
          <div
            key={bp.name}
            className="flex items-center gap-4 border-b border-white/10 py-3"
          >
            <code className="w-20 font-mono text-sm text-white">{bp.name}</code>
            <span className="w-20 font-mono text-xs text-gray-500">
              ≥ {bp.min}
            </span>
            <span className="flex-1 text-xs text-gray-400">{bp.usage}</span>
            <span
              className={`${bp.className} items-center rounded-full bg-brand-blue-accent px-3 py-1 text-xs font-medium text-white`}
            >
              활성
            </span>
          </div>
        ))}
      </div>
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("xl-nav")).toBeInTheDocument();
  },
};
