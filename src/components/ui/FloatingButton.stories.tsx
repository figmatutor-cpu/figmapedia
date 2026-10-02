import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { SearchProvider } from "@/components/search/SearchProvider";
import { FloatingButton } from "./FloatingButton";

const meta = {
  title: "UI/FloatingButton",
  component: FloatingButton,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/" } },
  },
  // useSearchContext 필요. search-index fetch는 Storybook에서 실패해도 빈 목록으로 처리됨
  decorators: [
    (Story) => (
      <SearchProvider>
        <div className="min-h-screen">
          <Story />
        </div>
      </SearchProvider>
    ),
  ],
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: /허들링 클럽/ });
    await expect(link).toHaveAttribute("target", "_blank");
  },
};

/** 홈 외 페이지 */
export const SubPage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/figma-info" } } },
};
