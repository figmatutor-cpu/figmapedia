import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportEmbed } from "@/components/ai-report/ReportEmbed";
import { ReportComments } from "@/components/ai-report/ReportComments";
import {
  getPublishedIssue,
  getReportOrigin,
  formatIssueDateLong,
  formatIssueLabel,
  toReportUrl,
} from "@/lib/ai-report";

// 발행일 게이팅이 날짜에 의존하므로 정적으로 굳히지 않는다
export const revalidate = 600;

/** 댓글 노출 여부. 운영 판단으로 현재 숨김 상태 */
const SHOW_COMMENTS = false;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://huddling.ai"
).trim();

/** "1" → 1. 소수/음수/문자는 null */
function parseIssueParam(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= 1 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issue: string }>;
}): Promise<Metadata> {
  const { issue: rawIssue } = await params;
  const issueNumber = parseIssueParam(rawIssue);
  if (issueNumber === null) return { title: "AI 리포트" };

  const report = await getPublishedIssue(issueNumber);
  if (!report) return { title: "AI 리포트" };

  const title = `${formatIssueLabel(report.issue)} · ${report.title}`;
  const description =
    report.summary ||
    `허들링 클럽 AI 리포트 ${formatIssueLabel(report.issue)} (${formatIssueDateLong(report.publishedAt)})`;

  return {
    title,
    description,
    alternates: { canonical: `/ai-report/${report.issue}` },
    openGraph: {
      title: `${title} | HuddlingClub`,
      description,
      type: "article",
      publishedTime: report.publishedAt,
      url: `${SITE_URL}/ai-report/${report.issue}`,
    },
  };
}

export default async function AiReportIssuePage({
  params,
}: {
  params: Promise<{ issue: string }>;
}) {
  const { issue: rawIssue } = await params;
  const issueNumber = parseIssueParam(rawIssue);
  if (issueNumber === null) notFound();

  const report = await getPublishedIssue(issueNumber);
  if (!report) notFound();

  const origin = getReportOrigin();
  const bodyUrl = toReportUrl(report.path);
  // getPublishedIssue가 값을 반환했다면 origin은 반드시 설정되어 있다
  if (!bodyUrl || !origin) notFound();

  const embedUrl = `${bodyUrl}${bodyUrl.includes("?") ? "&" : "?"}embed=1`;

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16 px-4">
      {/* 헤더 */}
      <div className="mx-auto max-w-4xl">
        <Link
          href="/ai-report"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          목록
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xxs px-2 py-0.5 rounded-full bg-brand-blue/20 text-blue-300 font-medium">
            {formatIssueLabel(report.issue)}
          </span>
          <span className="text-xs text-gray-500">
            {formatIssueDateLong(report.publishedAt)}
          </span>
        </div>

        <h1 className="text-lg font-bold text-white mb-2">{report.title}</h1>
        {report.summary && (
          <p className="text-sm text-gray-400 mb-4">{report.summary}</p>
        )}

        <a
          href={bodyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-6"
        >
          새 창에서 보기
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <path d="M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

      {/* 본문 — 리포트 앱을 iframe으로 격리 임베드 */}
      <div className="mx-auto max-w-6xl mb-10">
        <ReportEmbed
          src={embedUrl}
          origin={origin}
          title={`AI 리포트 ${formatIssueLabel(report.issue)} — ${report.title}`}
        />
      </div>

      {/* 댓글 — 현재 숨김. 다시 켜려면 SHOW_COMMENTS 를 true 로 */}
      {SHOW_COMMENTS && (
        <div className="mx-auto max-w-4xl">
          <ReportComments issue={report.issue} />
        </div>
      )}
    </div>
  );
}
