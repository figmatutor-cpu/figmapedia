import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  mockEntry,
  mockLongTitleEntry,
  mockShortcutEntry,
} from "@/stories/mocks";
import { VerticalCard } from "./VerticalCard";

const meta = {
  title: "Cards/VerticalCard",
  component: VerticalCard,
  tags: ["autodocs"],
  args: {
    entry: mockEntry,
    showTags: true,
    showMeta: true,
    externalLink: false,
  },
  // 카드 폭 고정. Grid 스토리는 parameters.cardWidth로 해제
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.cardWidth ?? "w-72"}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerticalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute(
      "href",
      `/entry/${mockEntry.id}`,
    );
    await expect(canvas.getByRole("img")).toHaveAttribute(
      "alt",
      mockEntry.title,
    );
  },
};

export const LongTitle: Story = {
  args: { entry: mockLongTitleEntry },
};

export const WithoutTagsAndMeta: Story = {
  args: { showTags: false, showMeta: false },
};

export const ExternalLink: Story = {
  args: {
    entry: { ...mockEntry, link: "https://www.figma.com/community" },
    externalLink: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("target", "_blank");
  },
};

/** 단축키 카드: 링크 없음 + 썸네일 플레이스홀더 */
export const Shortcut: Story = {
  args: { entry: mockShortcutEntry },
};

/** 여러 장 그리드 배치 */
export const Grid: Story = {
  parameters: { cardWidth: "grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3" },
  render: (args) => (
    <>
      <VerticalCard {...args} />
      <VerticalCard {...args} entry={mockLongTitleEntry} />
      <VerticalCard {...args} entry={{ ...mockEntry, id: "mock-entry-3" }} />
    </>
  ),
};
