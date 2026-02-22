import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

export function Badge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      {category}
    </span>
  );
}
