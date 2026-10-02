import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    count: { control: { type: "number", min: 1, max: 10 } },
  },
  args: { count: 3 },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const items = canvasElement.querySelectorAll(".animate-pulse");
    await expect(items).toHaveLength(args.count ?? 3);
  },
};

export const Single: Story = {
  args: { count: 1 },
};
