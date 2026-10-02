import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { LoadingSpinner } from "./LoadingSpinner";

const meta = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  args: { className: "w-6 h-6" },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("svg")).toBeInTheDocument(),
    );
  },
};

export const Large: Story = {
  args: { className: "w-12 h-12" },
};
