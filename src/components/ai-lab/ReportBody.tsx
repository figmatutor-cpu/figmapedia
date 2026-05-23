"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportBodyProps {
  body: string;
}

export function ReportBody({ body }: ReportBodyProps) {
  return (
    <article className="mt-10 text-sm leading-7 text-gray-300 md:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="mt-10 text-2xl font-semibold text-white"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2 className="mt-10 text-xl font-semibold text-white" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mt-8 text-lg font-semibold text-white" {...props} />
          ),
          p: ({ ...props }) => <p className="my-4 text-gray-300" {...props} />,
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
              className="my-4 list-disc space-y-1 pl-6 marker:text-gray-500"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="my-4 list-decimal space-y-1 pl-6 marker:text-gray-500"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="text-gray-300" {...props} />,
          code: ({ ...props }) => (
            <code
              className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-brand-blue-light"
              {...props}
            />
          ),
          pre: ({ ...props }) => (
            <pre
              className="my-4 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs text-gray-200"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs font-medium text-gray-300"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border border-white/10 px-3 py-2 text-sm text-gray-300"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-4 border-l-2 border-brand-blue pl-4 italic text-gray-400"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-8 border-white/10" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
