import { IssueList } from "@/components/ai-report/IssueList";
import { getNextScheduledIssue, getPublishedIssues } from "@/lib/ai-report";

// 발행일 게이팅이 날짜에 의존하므로 정적으로 굳히지 않는다
export const revalidate = 600;

/** 목록 1페이지. 2페이지 이상은 `/ai-report/page/[page]` */
export default async function AiReportPage() {
  const [reports, next] = await Promise.all([
    getPublishedIssues(),
    getNextScheduledIssue(),
  ]);

  return <IssueList reports={reports} next={next} currentPage={1} />;
}
