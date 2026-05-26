export function EntryMeta({
  author,
  publishedDate,
  className = "",
}: {
  author: string | null;
  publishedDate: string | null;
  className?: string;
}) {
  if (!author && !publishedDate) return null;

  return (
    <div className={`flex items-center gap-3 text-body text-fg-4 ${className}`}>
      {author && <span>{author}</span>}
      {publishedDate && (
        <span>{new Date(publishedDate).toLocaleDateString("ko-KR")}</span>
      )}
    </div>
  );
}
