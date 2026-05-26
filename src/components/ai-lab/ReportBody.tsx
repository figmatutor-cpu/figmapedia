"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportBodyProps {
  body: string;
}

export function ReportBody({ body }: ReportBodyProps) {
  return (
    <article className="mt-10 text-body leading-7 text-fg-2 md:text-body-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="mt-10 text-h2 font-semibold text-fg-1" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2
              className="mt-10 text-h3-lg font-semibold text-fg-1"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3 className="mt-8 text-h3 font-semibold text-fg-1" {...props} />
          ),
          p: ({ ...props }) => <p className="my-4 text-fg-2" {...props} />,
          a: ({ ...props }) => (
            <a
              className="text-brand-blue-light underline hover:text-brand-blue-accent"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="my-4 list-disc space-y-1 pl-6 marker:text-fg-4"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="my-4 list-decimal space-y-1 pl-6 marker:text-fg-4"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="text-fg-2" {...props} />,
          code: ({ ...props }) => (
            <code
              className="rounded bg-glass-1 px-1.5 py-0.5 text-meta text-brand-blue-light"
              {...props}
            />
          ),
          pre: ({ ...props }) => (
            <pre
              className="my-4 overflow-x-auto rounded-lg border border-border-1 bg-glass-1 p-4 text-meta text-fg-2"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-body" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-border-1 bg-glass-1 px-3 py-2 text-left text-meta font-medium text-fg-2"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border border-border-1 px-3 py-2 text-body text-fg-2"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-4 border-l-2 border-brand-blue pl-4 italic text-fg-3"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-8 border-border-1" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-fg-1" {...props} />
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
