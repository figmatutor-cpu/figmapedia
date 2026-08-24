import Link from "next/link";
import { SponsorBanner } from "@/components/ui/SponsorBanner";
import {
  formatIssueDateLong,
  formatIssueDateShort,
  formatIssueLabel,
  isWithinNewWindow,
  type AiReportIssue,
} from "@/lib/ai-report";

/**
 * AI 리포트 목록 화면 — `/ai-report`(1페이지)와 `/ai-report/page/[page]`가 공유한다.
 *
 * 페이지네이션을 searchParams가 아닌 경로로 두는 이유:
 * searchParams를 읽으면 라우트가 dynamic으로 내려가 HTML CDN 캐싱을 잃는다.
 * 경로로 나누면 각 페이지를 static으로 프리렌더할 수 있다.
 */

/** 한 페이지에 노출할 호 수 (toss.im/notice와 동일) */
export const PER_PAGE = 10;

/** 페이지 번호 → 경로. 1페이지는 `?page=1` 같은 중복 URL을 만들지 않는다 */
export function pageHref(page: number): string {
  return page <= 1 ? "/ai-report" : `/ai-report/page/${page}`;
}

/** 전체 호 수 → 총 페이지 수 (최소 1) */
export function totalPagesFor(issueCount: number): number {
  return Math.max(1, Math.ceil(issueCount / PER_PAGE));
}

/**
 * 목록 한 행 — 아카이브 색인(목차) 형태.
 *
 * 호수는 좌측 고정폭 열, 날짜는 우측 정렬로 떨어뜨려 한 열로 읽히게 한다.
 * 행 하단 언더바 라인으로만 구분하고, 호버 시 행 전체를 밝힌다.
 */
function IssueRow({
  report,
  isNew,
}: {
  report: AiReportIssue;
  isNew: boolean;
}) {
  return (
    <Link
      href={`/ai-report/${report.issue}`}
      className="group flex items-baseline gap-3 sm:gap-4 border-b border-white/10 px-2 py-4 transition-colors hover:bg-white/5"
    >
      {/* 호수 — 고정폭으로 제목 정렬선을 하나로 유지 */}
      <span className="shrink-0 w-10 sm:w-12 text-xs sm:text-sm tabular-nums text-right text-gray-500 group-hover:text-blue-300 transition-colors">
        {formatIssueLabel(report.issue)}
      </span>

      <h2 className="min-w-0 flex-1 text-sm sm:text-base text-gray-200 group-hover:text-white transition-colors truncate">
        {report.title}
      </h2>

      {/* NEW — 최신 호 + 발행 2주 이내에만. 제목이 길어도 눌리지 않게 shrink-0 */}
      {isNew && (
        <span
          aria-label="새 호"
          className="shrink-0 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-xxs font-bold tracking-wide text-blue-300"
        >
          NEW
        </span>
      )}

      <time
        dateTime={report.publishedAt}
        className="shrink-0 text-xxs sm:text-xs tabular-nums text-gray-600 group-hover:text-gray-400 transition-colors"
      >
        {formatIssueDateShort(report.publishedAt)}
      </time>
    </Link>
  );
}

/**
 * 표시할 페이지 번호 목록. 0은 말줄임(⋯) 자리.
 *
 * 전체가 좁으면 전부 노출하고, 넓으면 첫 페이지 · 현재 주변 · 마지막 페이지만 남긴다.
 * (toss.im/notice가 1페이지에서 `1 … 7 ⋯ 38`을 보여주는 방식)
 */
function buildPageItems(current: number, total: number): number[] {
  const WINDOW = 7;
  if (total <= WINDOW + 1) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // 현재 위치를 감싸는 WINDOW 크기 구간을 잡고 양끝으로 밀어 넣는다
  let start = Math.max(1, current - Math.floor(WINDOW / 2));
  const end = Math.min(total, start + WINDOW - 1);
  start = Math.max(1, end - WINDOW + 1);

  const items: number[] = [];
  if (start > 1) {
    items.push(1);
    if (start > 2) items.push(0);
  }
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total) {
    if (end < total - 1) items.push(0);
    items.push(total);
  }
  return items;
}

/**
 * 화살표 / 번호 공통 — 데스크탑 36px 원형 (toss.im/notice 치수), 모바일 32px.
 *
 * shrink-0 필수: 없으면 페이지 수가 많을 때 flex가 버튼을 눌러
 * 원이 타원으로 찌그러진다(모바일 38페이지에서 36px → 24px).
 */
const PAGE_ITEM_BASE =
  "inline-flex shrink-0 items-center justify-center size-8 sm:size-9 rounded-full text-xs sm:text-sm font-semibold tabular-nums transition-colors";

function Pagination({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null;

  const hrefFor = pageHref;

  return (
    // 페이지 수가 아주 많아지면(수십 페이지) 좁은 화면에서 가로 스크롤로 넘긴다.
    // w-max + min-w-full: 들어갈 때는 가운데 정렬, 넘칠 때만 스크롤.
    <nav aria-label="페이지" className="mt-8 overflow-x-auto">
      <div className="flex w-max min-w-full items-center justify-center gap-1">
        {/* 이전 */}
        {current > 1 ? (
          <Link
            href={hrefFor(current - 1)}
            aria-label="이전 페이지"
            className={`${PAGE_ITEM_BASE} text-gray-500 hover:text-white hover:bg-white/5`}
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
          </Link>
        ) : (
          <span
            className={`${PAGE_ITEM_BASE} text-gray-700`}
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
        )}

        {buildPageItems(current, total).map((page, i) =>
          page === 0 ? (
            <span
              key={`gap-${i}`}
              className={`${PAGE_ITEM_BASE} text-gray-600`}
              aria-hidden="true"
            >
              ⋯
            </span>
          ) : page === current ? (
            <span
              key={page}
              aria-current="page"
              className={`${PAGE_ITEM_BASE} bg-white/10 text-white`}
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={hrefFor(page)}
              className={`${PAGE_ITEM_BASE} text-gray-500 hover:text-white hover:bg-white/5`}
            >
              {page}
            </Link>
          ),
        )}

        {/* 다음 */}
        {current < total ? (
          <Link
            href={hrefFor(current + 1)}
            aria-label="다음 페이지"
            className={`${PAGE_ITEM_BASE} text-gray-500 hover:text-white hover:bg-white/5`}
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
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ) : (
          <span
            className={`${PAGE_ITEM_BASE} text-gray-700`}
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        )}
      </div>
    </nav>
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

/**
 * 목록 화면 전체 (헤더 + 행 + 페이지네이션 / 발행 전이면 엠티 스테이트).
 *
 * 두 라우트가 이 컴포넌트만 렌더한다 — 페이지 슬라이싱도 여기서 처리해
 * 라우트별로 로직이 갈리지 않게 한다.
 */
export function IssueList({
  reports,
  next,
  currentPage,
}: {
  /** 발행된 전체 호 (최신순) */
  reports: AiReportIssue[];
  /** 다음 발행 예정 호 — 엠티 스테이트 안내용 */
  next: AiReportIssue | null;
  currentPage: number;
}) {
  const totalPages = totalPagesFor(reports.length);
  const pageReports = reports.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  // NEW 라벨은 전체 목록의 최신 호 1개에만 (reports는 호수 내림차순).
  // 페이지를 넘겨 봐도 라벨이 페이지별로 다시 붙지 않는다.
  const newestIssue =
    reports[0] && isWithinNewWindow(reports[0].publishedAt)
      ? reports[0].issue
      : null;

  return (
    <div className="min-h-screen bg-bg-base pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <SponsorBanner />

        <h1 className="text-xl font-bold text-white mb-2">AI 리포트</h1>
        <p className="text-gray-400 mb-8 text-sm sm:text-base">
          격주로 발행되는 허들링 클럽 뉴스레터 아카이브입니다
        </p>

        {reports.length === 0 ? (
          <EmptyState next={next} />
        ) : (
          <>
            <div>
              {pageReports.map((report) => (
                <IssueRow
                  key={report.issue}
                  report={report}
                  isNew={report.issue === newestIssue}
                />
              ))}
            </div>
            <Pagination current={currentPage} total={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
