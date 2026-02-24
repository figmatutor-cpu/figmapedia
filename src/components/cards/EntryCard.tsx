import Link from "next/link";
import type { SearchIndexItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EntryMeta } from "@/components/ui/EntryMeta";

export function EntryCard({ entry }: { entry: SearchIndexItem }) {
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/[0.08] transition-all"
    >
      <div className={`flex gap-3 sm:gap-4 ${entry.shortcut ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "items-center justify-between"}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {entry.categories.map((cat) => (
              <Badge key={cat} category={cat} />
            ))}
          </div>
          <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
            {entry.title}
          </h3>
          <EntryMeta author={entry.author} publishedDate={entry.publishedDate} className="mt-2" />
        </div>

        {entry.shortcut && (
          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.07] border border-white/10 text-sm text-gray-300 font-mono whitespace-normal break-words sm:whitespace-nowrap">
            {entry.shortcut}
          </span>
        )}
      </div>
    </Link>
  );
}
