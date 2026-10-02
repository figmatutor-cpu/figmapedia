import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TokenSection } from "./TokenPreview";

/** src/CLAUDE.md "글래스모피즘 패턴" — 프로젝트 전반에서 반복되는 클래스 조합 */
const PATTERNS = [
  { name: "기본", className: "bg-white/5 border border-white/10" },
  { name: "호버", className: "bg-white/[0.08] border border-white/20" },
  {
    name: "활성 탭",
    className: "bg-white/10 border border-white/20 text-white",
  },
  {
    name: "비활성 탭",
    className: "bg-white/[0.03] border border-white/10 text-gray-400",
  },
  {
    name: "오버레이",
    className: "bg-glass-overlay backdrop-blur-md border border-white/10",
  },
  {
    name: "히어로",
    className: "bg-glass-hero backdrop-blur-md border border-white/10",
  },
];

const meta = {
  title: "Foundations/Glass",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Patterns: Story = {
  render: () => (
    <TokenSection
      title="Glassmorphism"
      description="카드·탭·모달에 반복 사용되는 반투명 표면 조합"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PATTERNS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col gap-2 rounded-xl p-4 ${p.className}`}
          >
            <span className="text-sm font-medium">{p.name}</span>
            <code className="font-mono text-xxs text-gray-400">
              {p.className}
            </code>
          </div>
        ))}
      </div>
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("오버레이")).toBeInTheDocument();
  },
};
