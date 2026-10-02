import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { EntryMeta } from "./EntryMeta";

const meta = {
  title: "UI/EntryMeta",
  component: EntryMeta,
  tags: ["autodocs"],
  args: { author: "피그마튜터", publishedDate: "2026-09-15" },
} satisfies Meta<typeof EntryMeta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("피그마튜터")).toBeInTheDocument();
    await expect(
      canvas.getByText(new Date("2026-09-15").toLocaleDateString("ko-KR")),
    ).toBeInTheDocument();
  },
};

export const AuthorOnly: Story = {
  args: { publishedDate: null },
};

export const DateOnly: Story = {
  args: { author: null },
};

/** author, publishedDate 모두 없으면 렌더링하지 않음 */
export const Empty: Story = {
  args: { author: null, publishedDate: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toBe("");
  },
};
