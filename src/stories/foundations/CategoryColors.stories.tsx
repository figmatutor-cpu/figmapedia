import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import { TokenSection } from "./TokenPreview";

const meta = {
  title: "Foundations/Category Colors",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`src/lib/constants.ts`의 `CATEGORY_COLORS` 매핑. 목록에 없는 카테고리는 `DEFAULT_CATEGORY_COLOR`로 표시됩니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <TokenSection
      title="Category Colors"
      description={`${Object.keys(CATEGORY_COLORS).length}개 카테고리 + 기본값`}
    >
      <div className="flex flex-col">
        {[
          ...Object.entries(CATEGORY_COLORS),
          ["(기본값)", DEFAULT_CATEGORY_COLOR] as const,
        ].map(([category, className]) => (
          <div
            key={category}
            className="flex items-center gap-4 border-b border-white/10 py-2"
          >
            <div className="w-40">
              <Badge category={category} />
            </div>
            <code className="font-mono text-xxs text-gray-500">
              {className}
            </code>
          </div>
        ))}
      </div>
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("플러그인")).toBeInTheDocument();
  },
};
