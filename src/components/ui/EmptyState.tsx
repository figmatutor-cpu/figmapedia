import { SearchIcon } from "@/components/ui/SearchIcon";

export function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-display mb-4">
        <SearchIcon className="mx-auto h-12 w-12 text-fg-5" strokeWidth={1.5} />
      </div>
      <h3 className="text-h3 font-medium text-fg-2 mb-1">
        검색 결과가 없습니다
      </h3>
      <p className="text-fg-3">
        {query
          ? `"${query}"에 대한 결과를 찾을 수 없습니다. 다른 키워드로 시도해보세요.`
          : "등록된 항목이 없습니다."}
      </p>
    </div>
  );
}
