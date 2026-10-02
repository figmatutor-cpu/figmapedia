import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SearchIcon } from "./SearchIcon";

const meta = {
  title: "UI/SearchIcon",
  component: SearchIcon,
  tags: ["autodocs"],
  argTypes: {
    strokeWidth: { control: { type: "range", min: 0.5, max: 3, step: 0.5 } },
  },
  args: { className: "h-5 w-5 text-gray-400", strokeWidth: 2 },
} satisfies Meta<typeof SearchIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const path = canvasElement.querySelector("svg path");
    await expect(path).toHaveAttribute("stroke-width", "2");
  },
};

/** EmptyState에서 사용하는 크기 */
export const Large: Story = {
  args: { className: "h-12 w-12 text-gray-600", strokeWidth: 1.5 },
};
