import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { CATEGORY_COLORS } from "@/lib/constants";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    category: {
      control: "select",
      options: [...Object.keys(CATEGORY_COLORS), "미등록 카테고리"],
    },
  },
  args: { category: "플러그인" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(args.category)).toBeInTheDocument();
  },
};

/** CATEGORY_COLORS에 없는 카테고리 → DEFAULT_CATEGORY_COLOR */
export const UnknownCategory: Story = {
  args: { category: "미등록 카테고리" },
};

export const AllCategories: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(CATEGORY_COLORS).map((category) => (
        <Badge key={category} category={category} />
      ))}
    </div>
  ),
};
