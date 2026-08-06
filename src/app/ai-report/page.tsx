import Link from "next/link";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import {
  getNextScheduledIssue,
  getPublishedIssues,
  formatIssueDateLong,
  formatIssueDateShort,
  formatIssueLabel,
  toReportUrl,
  type AiReportIssue,
} from "@/lib/ai-report";

// 발행일 게이팅이 날짜에 의존하므로 정적으로 굳히지 않는다
export const revalidate = 600;

/** 호수 배지 — 기존 공지 배지(pin_label) 스타일 재사용 */
function IssueBadge({ issue }: { issue: number }) {
  return (
    <span className="text-xxs px-2 py-0.5 rounded-full bg-brand-blue/20 text-blue-300 font-medium shrink-0">
      {formatIssueLabel(issue)}
    </span>
  );
}

function IssueCard({ report }: { report: AiReportIssue }) {
  const thumbnailUrl = report.thumbnail ? toReportUrl(report.thumbnail) : null;

  return (
    <Link
      href={`/ai-report/${report.issue}`}
      className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
    >
      {thumbnailUrl && (
        <div className="hidden sm:block shrink-0 w-[140px] aspect-video rounded-lg overflow-hidden bg-white/5">
          {/* 리포트 앱 origin이 환경변수라 next/image remotePatterns로 고정할 수 없음 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <IssueBadge issue={report.issue} />
          <span className="text-xxs text-gray-500">
            {formatIssueDateShort(report.publishedAt)}
          </span>
        </div>
        <h2 className="text-base font-medium text-white truncate">
          {report.title}
        </h2>
        {report.summary && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
            {report.summary}
          </p>
        )}
      </div>
    </Link>
  );
}

/** 1호 발행 전에 노출되는 화면 */
function EmptyState({ next }: { next: AiReportIssue | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
      <svg
        className="mx-auto mb-4 w-10 h-10 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h5" />
      </svg>
      <p className="text-base text-gray-300 mb-2">
        첫 번째 리포트를 준비하고 있습니다
      </p>
      {next ? (
        <p className="text-sm text-gray-500">
          {formatIssueLabel(next.issue)} ·{" "}
          {formatIssueDateLong(next.publishedAt)} 발행 예정
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          발행이 시작되면 이곳에 지난 호가 쌓입니다
        </p>
      )}
    </div>
  );
}

export default async function AiReportPage() {
  const [reports, next] = await Promise.all([
    getPublishedIssues(),
    getNextScheduledIssue(),
  ]);

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <SponsorBanner />

        <h1 className="text-xl font-bold text-white mb-2">AI리포트</h1>
        <p className="text-gray-400 mb-8 text-sm sm:text-base">
          격주로 발행되는 허들링 클럽 뉴스레터 아카이브입니다
        </p>

        {reports.length === 0 ? (
          <EmptyState next={next} />
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <IssueCard key={report.issue} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
