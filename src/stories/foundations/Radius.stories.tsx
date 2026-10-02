import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TokenSection, useComputedStyle } from "./TokenPreview";

/** --radius(0.625rem) 기반 shadcn 스케일 + full */
const RADII = [
  { name: "rounded-sm", className: "rounded-sm", usage: "--radius - 4px" },
  { name: "rounded-md", className: "rounded-md", usage: "--radius - 2px" },
  {
    name: "rounded-lg",
    className: "rounded-lg",
    usage: "--radius · 인풋, 썸네일",
  },
  {
    name: "rounded-xl",
    className: "rounded-xl",
    usage: "--radius + 4px · 카드, 배너",
  },
  { name: "rounded-2xl", className: "rounded-2xl", usage: "--radius + 8px" },
  { name: "rounded-3xl", className: "rounded-3xl", usage: "--radius + 12px" },
  { name: "rounded-4xl", className: "rounded-4xl", usage: "--radius + 16px" },
  { name: "rounded-full", className: "rounded-full", usage: "버튼, 탭" },
];

function RadiusItem({ name, className, usage }: (typeof RADII)[number]) {
  const { ref, value } = useComputedStyle<HTMLDivElement>(
    "borderTopLeftRadius",
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ref}
        className={`h-20 border border-white/20 bg-white/5 ${className}`}
      />
      <code className="font-mono text-xs text-white">{name}</code>
      <span className="font-mono text-xxs text-gray-500">{value}</span>
      <span className="text-xs text-gray-400">{usage}</span>
    </div>
  );
}

const meta = {
  title: "Foundations/Radius",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <TokenSection
      title="Radius"
      description="globals.css `--radius-*` (기준값 --radius: 0.625rem)"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {RADII.map((r) => (
          <RadiusItem key={r.name} {...r} />
        ))}
      </div>
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("rounded-xl")).toBeInTheDocument();
  },
};
