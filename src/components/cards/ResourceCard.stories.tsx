import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { MOCK_THUMBNAIL_WIDE, mockResource } from "@/stories/mocks";
import { ResourceCard } from "./ResourceCard";

const meta = {
  title: "Cards/ResourceCard",
  component: ResourceCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "wide"] },
  },
  args: { resource: mockResource, variant: "default" },
  // 카드 폭 고정. wide variant는 parameters.cardWidth로 변경
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.cardWidth ?? "w-72"}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResourceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** template 카테고리: 옐로 테두리 강조 + "템플릿" 배지 */
export const Template: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("target", "_blank");
    await expect(canvas.getByText("템플릿")).toBeInTheDocument();
  },
};

export const ClassMaterial: Story = {
  args: {
    resource: {
      ...mockResource,
      title: "UX/UI 기초 수업자료",
      category: "class",
    },
  },
};

export const WeeklyLive: Story = {
  args: {
    resource: {
      ...mockResource,
      title: "주간 라이브 다시보기",
      category: "live",
    },
  },
};

export const AtoZ: Story = {
  args: {
    resource: {
      ...mockResource,
      title: "Figma A to Z — 컴포넌트 편",
      category: "atoz",
    },
  },
};

export const Wide: Story = {
  args: {
    variant: "wide",
    resource: { ...mockResource, thumbnail: MOCK_THUMBNAIL_WIDE },
  },
  parameters: { cardWidth: "w-96" },
};
