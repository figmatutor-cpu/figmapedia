import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { mockCategories } from "@/stories/mocks";
import { FilterModal } from "./FilterModal";

const meta = {
  title: "UI/FilterModal",
  component: FilterModal,
  tags: ["autodocs"],
  args: { categories: mockCategories, selected: [], onChange: fn() },
  // 모달이 버튼 오른쪽 기준으로 열리므로 공간 확보
  decorators: [
    (Story) => (
      <div className="flex min-h-105 items-start justify-end">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <FilterModal
        {...args}
        onChange={(selected) => {
          args.onChange(selected);
          updateArgs({ selected });
        }}
      />
    );
  },
} satisfies Meta<typeof FilterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const WithSelection: Story = {
  args: { selected: ["컴포넌트", "베리어블"] },
};

/** 버튼 클릭 → 모달 열림 → 카테고리 선택 */
export const OpenAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("카테고리 필터")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("checkbox", { name: "플러그인" }));
    await waitFor(() =>
      expect(canvas.getByRole("checkbox", { name: "플러그인" })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
  },
};

/** 검색 결과가 없을 때 */
export const SearchNoResult: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.type(
      canvas.getByPlaceholderText("카테고리 검색 또는 선택"),
      "없는카테고리",
    );
    await expect(canvas.getByText("결과 없음")).toBeInTheDocument();
  },
};
