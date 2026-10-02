import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ColorSwatch, TokenSection, type ColorToken } from "./TokenPreview";

/** globals.css `@theme inline` 커스텀 컬러 */
const BRAND_TOKENS: ColorToken[] = [
  { name: "bg-base", className: "bg-bg-base", usage: "페이지 배경" },
  {
    name: "brand-blue",
    className: "bg-brand-blue",
    usage: "브랜드 액센트, 호버 텍스트",
  },
  {
    name: "brand-blue-accent",
    className: "bg-brand-blue-accent",
    usage: "활성 탭, 체크박스",
  },
  {
    name: "brand-blue-light",
    className: "bg-brand-blue-light",
    usage: "브랜드 라이트",
  },
];

const SURFACE_TOKENS: ColorToken[] = [
  {
    name: "navbar-bg",
    className: "bg-navbar-bg",
    usage: "네비게이션 반투명 배경",
  },
  {
    name: "navbar-border",
    className: "bg-navbar-border",
    usage: "네비게이션 테두리",
  },
  {
    name: "glass-hero",
    className: "bg-glass-hero",
    usage: "히어로 글래스 배경",
  },
  {
    name: "glass-overlay",
    className: "bg-glass-overlay",
    usage: "오버레이·필터 모달 배경",
  },
  { name: "modal-bg", className: "bg-modal-bg", usage: "모달 배경" },
  {
    name: "floating-bg",
    className: "bg-floating-bg",
    usage: "플로팅 메뉴 배경",
  },
  {
    name: "floating-item",
    className: "bg-floating-item",
    usage: "플로팅 메뉴 아이템",
  },
  {
    name: "floating-item-hover",
    className: "bg-floating-item-hover",
    usage: "플로팅 메뉴 아이템 호버",
  },
];

const FOOTER_TOKENS: ColorToken[] = [
  { name: "footer-link", className: "bg-footer-link", usage: "푸터 링크" },
  { name: "footer-sub", className: "bg-footer-sub", usage: "푸터 보조 텍스트" },
  { name: "footer-meta", className: "bg-footer-meta", usage: "푸터 메타 정보" },
];

/** shadcn 시맨틱 컬러 (:root / .dark) */
const SEMANTIC_TOKENS: ColorToken[] = [
  { name: "background", className: "bg-background", usage: "--background" },
  { name: "foreground", className: "bg-foreground", usage: "--foreground" },
  { name: "card", className: "bg-card", usage: "--card" },
  { name: "popover", className: "bg-popover", usage: "--popover" },
  { name: "primary", className: "bg-primary", usage: "--primary" },
  { name: "secondary", className: "bg-secondary", usage: "--secondary" },
  { name: "muted", className: "bg-muted", usage: "--muted" },
  { name: "accent", className: "bg-accent", usage: "--accent" },
  { name: "destructive", className: "bg-destructive", usage: "--destructive" },
  { name: "border", className: "bg-border", usage: "--border" },
  { name: "input", className: "bg-input", usage: "--input" },
  { name: "ring", className: "bg-ring", usage: "--ring" },
  { name: "chart-1", className: "bg-chart-1", usage: "--chart-1" },
  { name: "chart-2", className: "bg-chart-2", usage: "--chart-2" },
  { name: "chart-3", className: "bg-chart-3", usage: "--chart-3" },
  { name: "chart-4", className: "bg-chart-4", usage: "--chart-4" },
  { name: "chart-5", className: "bg-chart-5", usage: "--chart-5" },
];

function SwatchGrid({ tokens }: { tokens: ColorToken[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tokens.map((token) => (
        <ColorSwatch key={token.name} token={token} />
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Colors",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`src/app/globals.css`에 정의된 컬러 토큰. 표시 값은 브라우저 computed style에서 읽어오므로 globals.css 수정 시 자동 반영됩니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  render: () => (
    <TokenSection title="Brand" description="브랜드 컬러와 페이지 배경">
      <SwatchGrid tokens={BRAND_TOKENS} />
    </TokenSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const token of BRAND_TOKENS) {
      await expect(canvas.getByText(token.name)).toBeInTheDocument();
    }
  },
};

export const Surface: Story = {
  render: () => (
    <TokenSection
      title="Surface"
      description="네비게이션·글래스·모달·플로팅 표면"
    >
      <SwatchGrid tokens={SURFACE_TOKENS} />
    </TokenSection>
  ),
};

export const Footer: Story = {
  render: () => (
    <TokenSection title="Footer" description="푸터 텍스트 컬러">
      <SwatchGrid tokens={FOOTER_TOKENS} />
    </TokenSection>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenSection
        title="Semantic — Light"
        description=":root (shadcn 기본값)"
      >
        <SwatchGrid tokens={SEMANTIC_TOKENS} />
      </TokenSection>
      <div className="dark">
        <TokenSection title="Semantic — Dark" description=".dark 클래스 하위">
          <SwatchGrid tokens={SEMANTIC_TOKENS} />
        </TokenSection>
      </div>
    </div>
  ),
};
