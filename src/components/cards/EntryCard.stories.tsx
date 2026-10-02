import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";
import {
  mockEntry,
  mockGlossaryEntry,
  mockLongTitleEntry,
  mockShortcutEntry,
} from "@/stories/mocks";
import { EntryCard } from "./EntryCard";

const meta = {
  title: "Cards/EntryCard",
  component: EntryCard,
  tags: ["autodocs"],
  args: { entry: mockEntry, showThumbnail: false, nonClickable: false },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본: /entry/{id} 내부 링크 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute(
      "href",
      `/entry/${mockEntry.id}`,
    );
  },
};

export const WithThumbnail: Story = {
  args: { showThumbnail: true },
};

export const LongTitle: Story = {
  args: { entry: mockLongTitleEntry, showThumbnail: true },
};

/** 단축키 카드: 클릭 시 단축키 복사 */
export const Shortcut: Story = {
  args: { entry: mockShortcutEntry },
  // 브라우저 클립보드 권한과 무관하게 동작하도록 writeText를 대체
  beforeEach: () => {
    const spy = spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    return () => spy.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(mockShortcutEntry.shortcut!));
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockShortcutEntry.shortcut,
    );
    await waitFor(() =>
      expect(canvas.getByText("복사됨!")).toBeInTheDocument(),
    );
  },
};

/** 용어집: 클릭 불가 + 호버 시 복사 버튼 */
export const NonClickable: Story = {
  args: { entry: mockGlossaryEntry, nonClickable: true },
};

/** 리소스 항목: 외부 링크 새 탭 */
export const ExternalResource: Story = {
  args: {
    entry: {
      ...mockEntry,
      id: "resource-mock-1",
      link: "https://www.figma.com/community",
    },
  },
};

/** AI 리포트: /ai-report/{호수} */
export const AiReport: Story = {
  args: {
    entry: { ...mockEntry, id: "ai-report-4", categories: ["AI 리포트"] },
  },
};
