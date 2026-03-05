"use client";

import { useState } from "react";
import type { NotionBlock } from "@/types";
import { CodeBlock } from "./CodeBlock";

function RenderChildren({ blocks }: { blocks: NotionBlock[] }) {
  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </>
  );
}

function ToggleHeading({
  content,
  children,
  headingClass,
  wrapperClass,
}: {
  content: string;
  children: NotionBlock[];
  headingClass: string;
  wrapperClass: string;
}) {
  const [open, setOpen] = useState(false);
  const count = children.length;

  return (
    <div className={wrapperClass}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left rounded-lg px-2 py-1 -mx-2 cursor-pointer hover:bg-white/5 transition-colors group"
      >
        <svg
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90 text-white" : "text-gray-500 group-hover:text-gray-300"}`}
          width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
        >
          <path d="M4.5 2 L10.5 7 L4.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className={headingClass}>{content}</span>
        {!open && (
          <span className="ml-auto text-xs text-gray-600 group-hover:text-gray-500 shrink-0 transition-colors">
            {count}개 항목
          </span>
        )}
      </button>
      {open && (
        <div className="ml-5 mt-2 border-l border-white/10 pl-4">
          <RenderChildren blocks={children} />
        </div>
      )}
    </div>
  );
}

function RenderBlock({ block }: { block: NotionBlock }) {
  const [toggleOpen, setToggleOpen] = useState(false);

  switch (block.type) {
    case "paragraph":
      if (!block.content) return <div className="h-4" />;
      return <p className="text-gray-300 leading-relaxed mb-4">{block.content}</p>;

    case "heading_1":
      if (block.children && block.children.length > 0) {
        return (
          <ToggleHeading
            content={block.content}
            children={block.children}
            headingClass="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors"
            wrapperClass="mt-8 mb-2"
          />
        );
      }
      return <h1 className="text-2xl font-bold text-white mt-8 mb-4">{block.content}</h1>;

    case "heading_2":
      if (block.children && block.children.length > 0) {
        return (
          <ToggleHeading
            content={block.content}
            children={block.children}
            headingClass="text-xl font-bold text-white group-hover:text-gray-200 transition-colors"
            wrapperClass="mt-6 mb-2"
          />
        );
      }
      return <h2 className="text-xl font-bold text-white mt-6 mb-3">{block.content}</h2>;

    case "heading_3":
      if (block.children && block.children.length > 0) {
        return (
          <ToggleHeading
            content={block.content}
            children={block.children}
            headingClass="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors"
            wrapperClass="mt-5 mb-2"
          />
        );
      }
      return <h3 className="text-lg font-semibold text-gray-100 mt-5 mb-2">{block.content}</h3>;

    case "bulleted_list_item":
      return (
        <li className="text-gray-300 ml-5 list-disc mb-1">
          {block.content}
          {block.children && block.children.length > 0 && (
            <ul className="mt-1">
              <RenderChildren blocks={block.children} />
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-gray-300 ml-5 list-decimal mb-1">
          {block.content}
          {block.children && block.children.length > 0 && (
            <ol className="mt-1">
              <RenderChildren blocks={block.children} />
            </ol>
          )}
        </li>
      );

    case "to_do":
      return (
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={block.checked ?? false}
            readOnly
            className="mt-1 h-4 w-4 shrink-0 accent-blue-400 cursor-default"
          />
          <span className={`text-gray-300 ${block.checked ? "line-through text-gray-500" : ""}`}>
            {block.content}
          </span>
        </div>
      );

    case "toggle":
      return (
        <div className="my-2">
          <button
            onClick={() => setToggleOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left text-gray-200 font-medium hover:text-white transition-colors"
          >
            <span
              className="text-gray-400 transition-transform duration-200 shrink-0"
              style={{ transform: toggleOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▶
            </span>
            {block.content}
          </button>
          {toggleOpen && block.children && block.children.length > 0 && (
            <div className="ml-5 mt-2 border-l border-white/10 pl-4">
              <RenderChildren blocks={block.children} />
            </div>
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-white/20 pl-4 py-1 my-4 text-gray-400 italic">
          {block.content}
          {block.children && block.children.length > 0 && (
            <div className="mt-2 not-italic">
              <RenderChildren blocks={block.children} />
            </div>
          )}
        </blockquote>
      );

    case "callout":
      return (
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg p-4 my-4">
          {block.icon && (
            <span className="text-xl shrink-0 leading-none mt-0.5">
              {block.icon.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.icon} alt="" className="w-5 h-5 object-contain" />
              ) : (
                block.icon
              )}
            </span>
          )}
          <div className="text-gray-300 min-w-0">
            {block.content}
            {block.children && block.children.length > 0 && (
              <div className="mt-2">
                <RenderChildren blocks={block.children} />
              </div>
            )}
          </div>
        </div>
      );

    case "code":
      return <CodeBlock content={block.content} language={block.language} />;

    case "divider":
      return <hr className="border-white/10 my-6" />;

    case "column_list":
      if (!block.children || block.children.length === 0) return null;
      return (
        <div
          className="grid gap-6 my-4"
          style={{ gridTemplateColumns: `repeat(${block.children.length}, 1fr)` }}
        >
          <RenderChildren blocks={block.children} />
        </div>
      );

    case "column":
      if (!block.children || block.children.length === 0) return null;
      return (
        <div className="min-w-0">
          <RenderChildren blocks={block.children} />
        </div>
      );

    case "table": {
      if (!block.children || block.children.length === 0) return null;
      const rows = block.children;
      const [headerRow, ...bodyRows] = rows;
      const headerCells = headerRow?.content?.split("\t") ?? [];
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm text-gray-300 border border-white/10 rounded-lg overflow-hidden">
            {headerCells.length > 0 && (
              <thead>
                <tr className="bg-white/10">
                  {headerCells.map((cell, i) => (
                    <th key={i} className="px-4 py-2 text-left text-white font-semibold border-b border-white/10">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row) => {
                const cells = row.content?.split("\t") ?? [];
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    {cells.map((cell, i) => (
                      <td key={i} className="px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

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
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

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
