import type { NotionBlock, RichTextItem } from "@/types";
import { CodeBlock } from "./CodeBlock";

function RenderRichText({ items, fallback }: { items?: RichTextItem[]; fallback: string }) {
  if (!items || items.length === 0) return <>{fallback}</>;

  return (
    <>
      {items.map((item, i) => {
        let node: React.ReactNode = item.plain_text;

        if (item.annotations.code) node = <code className="bg-white/10 rounded px-1 text-sm font-mono">{node}</code>;
        if (item.annotations.bold) node = <strong>{node}</strong>;
        if (item.annotations.italic) node = <em>{node}</em>;
        if (item.annotations.strikethrough) node = <s>{node}</s>;
        if (item.annotations.underline) node = <u>{node}</u>;

        if (item.href) {
          node = (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300 transition-colors"
            >
              {node}
            </a>
          );
        }

        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function RenderBlock({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "paragraph":
      if (!block.content) return <div className="h-4" />;
      return <p className="text-gray-300 leading-relaxed mb-4"><RenderRichText items={block.richText} fallback={block.content} /></p>;

    case "heading_1":
      return (
        <h1 className="text-2xl font-bold text-white mt-8 mb-4">
          <RenderRichText items={block.richText} fallback={block.content} />
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-xl font-bold text-white mt-6 mb-3">
          <RenderRichText items={block.richText} fallback={block.content} />
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-lg font-semibold text-gray-100 mt-5 mb-2">
          <RenderRichText items={block.richText} fallback={block.content} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-gray-300 ml-5 list-disc mb-1"><RenderRichText items={block.richText} fallback={block.content} /></li>
      );

    case "numbered_list_item":
      return (
        <li className="text-gray-300 ml-5 list-decimal mb-1">
          <RenderRichText items={block.richText} fallback={block.content} />
        </li>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-white/20 pl-4 py-1 my-4 text-gray-400 italic">
          <RenderRichText items={block.richText} fallback={block.content} />
        </blockquote>
      );

    case "callout":
      return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-4 text-gray-300">
          <RenderRichText items={block.richText} fallback={block.content} />
        </div>
      );

    case "code":
      return <CodeBlock content={block.content} />;

    case "divider":
      return <hr className="border-white/10 my-6" />;

    case "image":
      if (!block.mediaUrl) return null;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.mediaUrl}
            alt={block.caption || ""}
            className="rounded-lg max-w-full"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-xs text-gray-500 mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      if (!block.mediaUrl) return null;
      // YouTube / Vimeo external embeds
      if (
        block.mediaUrl.includes("youtube.com") ||
        block.mediaUrl.includes("youtu.be") ||
        block.mediaUrl.includes("vimeo.com")
      ) {
        const embedUrl = toEmbedUrl(block.mediaUrl);
        return (
          <figure className="my-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={block.caption || "Video"}
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-gray-500 mt-2 text-center">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      // Direct video file
      return (
        <figure className="my-6">
          <video
            src={block.mediaUrl}
            controls
            className="rounded-lg max-w-full"
            preload="metadata"
          />
          {block.caption && (
            <figcaption className="text-xs text-gray-500 mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "embed":
      if (!block.mediaUrl) return null;
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
            <iframe
              src={block.mediaUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={block.caption || "Embed"}
            />
          </div>
          {block.caption && (
            <figcaption className="text-xs text-gray-500 mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "bookmark":
      if (!block.mediaUrl) return null;
      return (
        <a
          href={block.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block my-4 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/[0.08] transition-colors"
        >
          <span className="text-sm text-blue-400 underline break-all">
            {block.caption || block.mediaUrl}
          </span>
        </a>
      );

    case "file":
    case "pdf":
      if (!block.mediaUrl) return null;
      return (
        <a
          href={block.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 my-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-400 hover:bg-white/[0.08] transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {block.caption || "파일 다운로드"}
        </a>
      );

    default:
      if (block.content) {
        return <p className="text-gray-300 mb-4">{block.content}</p>;
      }
      return null;
  }
}

/** Convert a YouTube/Vimeo watch URL to an embeddable URL */
function toEmbedUrl(url: string): string {
  // YouTube: watch?v=ID → embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: vimeo.com/ID → player.vimeo.com/video/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}

export function NotionBlockRenderer({ blocks }: { blocks: NotionBlock[] }) {
  return (
    <div className="prose-figmapedia">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
