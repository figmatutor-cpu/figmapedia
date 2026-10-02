import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: { query: "오토 레이아웃" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 검색어가 있을 때 */
export const WithQuery: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    await expect(canvas.getByText(new RegExp(args.query))).toBeInTheDocument();
  },
};

/** 검색어 없이 항목이 비어 있을 때 */
export const NoItems: Story = {
  args: { query: "" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("등록된 항목이 없습니다."),
    ).toBeInTheDocument();
  },
};
