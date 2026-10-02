import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SegmentedControl } from "./SegmentedControl";

const TABS = [
  { key: "all", label: "전체", count: 128 },
  { key: "basic", label: "기초 인터페이스", count: 42 },
  { key: "autolayout", label: "오토 레이아웃", count: 31 },
  { key: "component", label: "컴포넌트", count: 27 },
  { key: "variable", label: "베리어블", count: 18 },
];

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: { tabs: TABS, activeTab: "all", onTabChange: fn() },
  // 탭 클릭 시 activeTab arg를 갱신해 실제 동작처럼 전환
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <SegmentedControl
        {...args}
        onTabChange={(key) => {
          args.onTabChange(key);
          updateArgs({ activeTab: key });
        }}
      />
    );
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** 탭 클릭 → 활성 스타일(brand-blue-accent)로 전환 */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole("button", { name: /컴포넌트/ });
    await userEvent.click(tab);
    await waitFor(() => expect(tab).toHaveClass("bg-brand-blue-accent"));
    await expect(canvas.getByRole("button", { name: /전체/ })).not.toHaveClass(
      "bg-brand-blue-accent",
    );
  },
};

export const WithoutCount: Story = {
  args: { tabs: TABS.map(({ key, label }) => ({ key, label })) },
};

/** 탭이 많을 때 가로 스크롤 */
export const Overflow: Story = {
  args: {
    tabs: [
      ...TABS,
      { key: "proto", label: "프로토타이핑", count: 12 },
      { key: "devmode", label: "데브모드", count: 9 },
      { key: "figjam", label: "피그잼", count: 7 },
      { key: "slides", label: "피그마 슬라이드", count: 5 },
    ],
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
