import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SponsorBanner } from "./SponsorBanner";

/** SponsorBanner 내부 STORAGE_KEY와 동일 — 스토리 진입 시 닫힘 상태 초기화 */
const STORAGE_KEY = "huddling-club-4th-waitlist-banner-dismissed";

const meta = {
  title: "UI/SponsorBanner",
  component: SponsorBanner,
  tags: ["autodocs"],
  beforeEach: () => {
    sessionStorage.removeItem(STORAGE_KEY);
  },
} satisfies Meta<typeof SponsorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 닫기 버튼 클릭 → 배너 숨김 + sessionStorage 기록 */
export const Dismiss: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = await canvas.findByRole("button", { name: "배너 닫기" });
    await userEvent.click(close);
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "배너 닫기" })).toBeNull(),
    );
    await expect(sessionStorage.getItem(STORAGE_KEY)).toBe("1");
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
