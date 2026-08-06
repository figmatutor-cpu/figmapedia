import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { IssueList, totalPagesFor } from "@/components/ai-report/IssueList";
import { getNextScheduledIssue, getPublishedIssues } from "@/lib/ai-report";

// 발행일 게이팅이 날짜에 의존하므로 정적으로 굳히지 않는다
export const revalidate = 600;

/**
 * 목록 2페이지 이상.
 *
 * `?page=2` 대신 경로로 나눈 이유: searchParams를 읽으면 라우트가 dynamic이 되어
 * HTML CDN 캐싱을 잃는다. 경로면 각 페이지를 static으로 프리렌더할 수 있다.
 */

/** "2" → 2. 소수/음수/문자는 null */
function parsePageParam(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= 1 ? n : null;
}

/**
 * 빌드 시점의 2..N 페이지를 미리 만든다.
 * 이후 호가 늘어 새 페이지가 생기면 첫 요청에 온디맨드로 렌더된 뒤 캐시된다.
 */
export async function generateStaticParams() {
  const reports = await getPublishedIssues();
  const totalPages = totalPagesFor(reports.length);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = parsePageParam(page);
  if (pageNumber === null) return { title: "AI 리포트" };

  return {
    title: `AI 리포트 (${pageNumber}페이지)`,
    alternates: { canonical: `/ai-report/page/${pageNumber}` },
    // 목록 하위 페이지는 색인 가치가 낮고 본문 중복이라 크롤만 허용
    robots: { index: false, follow: true },
  };
}

export default async function AiReportPagedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = parsePageParam(page);
  if (pageNumber === null) notFound();

  // /ai-report/page/1 은 /ai-report 와 같은 내용 → 정규 URL로 보낸다
  if (pageNumber === 1) redirect("/ai-report");

  const [reports, next] = await Promise.all([
    getPublishedIssues(),
    getNextScheduledIssue(),
  ]);

  if (pageNumber > totalPagesFor(reports.length)) notFound();

  return <IssueList reports={reports} next={next} currentPage={pageNumber} />;
}
