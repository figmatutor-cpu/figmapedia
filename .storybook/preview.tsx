import type { Preview } from "@storybook/nextjs-vite";
import { themes } from "storybook/theming";
import "../src/app/globals.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    // 컴포넌트가 next/navigation(App Router)을 사용
    nextjs: { appDirectory: true },
    layout: "padded",
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    docs: { theme: themes.dark },
    a11y: { test: "todo" },
  },
  decorators: [
    // layout.tsx의 <body> 클래스와 동일하게 렌더링
    (Story) => (
      <div className="font-sans antialiased bg-bg-base text-gray-100">
        <Story />
      </div>
    ),
  ],
};

export default preview;
