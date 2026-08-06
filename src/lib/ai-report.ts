import { unstable_cache } from "next/cache";

/**
 * AI 리포트 — 격주 발행 뉴스레터 아카이브
 *
 * 본문은 별도 Next.js 앱(huddlingclub-report)에서 렌더하고 iframe으로 임베드한다.
 * 목록 메타데이터는 그 앱의 `public/reports.json` 하나만 읽는다.
 * 새 호 발행 = 리포트 레포에 reports.json 항목 1개 추가 + push. 이 앱은 수정 불필요.
 */

/** reports.json 한 항목 */
export interface AiReportIssue {
  /** 호수 (1부터). 표시: "1호" */
  issue: number;
  title: string;
  /** 목록 카드에 노출되는 한 줄 요약 */
  summary: string;
  /** 발행일 YYYY-MM-DD (KST 기준). 이 날짜 전에는 목록에 노출되지 않는다 */
  publishedAt: string;
  /** 리포트 앱 기준 절대 경로 (예: /community/report/001) */
  path: string;
  /** true면 발행일과 무관하게 숨김 (작성 중) */
  draft?: boolean;
}

/**
 * 리포트 앱 origin. 미설정 시 목록은 빈 배열 → 엠티 스테이트.
 *
 * 서버에서만 읽으므로 NEXT_PUBLIC_ 접두사를 붙이지 않는다.
 * (NEXT_PUBLIC_은 빌드 타임에 인라인돼 값 변경 시 재배포가 필요하다)
 */
const REPORT_ORIGIN = (process.env.AI_REPORT_URL ?? "")
  .trim()
  .replace(/\/$/, "");

export function getReportOrigin(): string {
  return REPORT_ORIGIN;
}

/** 리포트 앱의 상대 경로를 절대 URL로. origin 미설정이면 null */
export function toReportUrl(path: string): string | null {
  if (!REPORT_ORIGIN) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${REPORT_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 오늘 날짜를 KST 기준 YYYY-MM-DD로. publishedAt과 문자열 비교 가능 */
function todayInKST(): string {
  // en-CA 로케일은 YYYY-MM-DD 포맷을 반환한다
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** 호수 → 댓글 테이블에 저장하는 키 (예: 1 → "report-001") */
export function issueCommentKey(issue: number): string {
  return `report-${String(issue).padStart(3, "0")}`;
}

/** 알 수 없는 형태의 항목을 걸러내고 정규화 */
function normalize(raw: unknown): AiReportIssue | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const issue = Number(r.issue);
  if (!Number.isInteger(issue) || issue < 1) return null;
  if (typeof r.title !== "string" || !r.title.trim()) return null;
  if (typeof r.path !== "string" || !r.path.trim()) return null;
  if (
    typeof r.publishedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(r.publishedAt)
  ) {
    return null;
  }

  return {
    issue,
    title: r.title.trim(),
    summary: typeof r.summary === "string" ? r.summary.trim() : "",
    publishedAt: r.publishedAt,
    path: r.path.trim(),
    draft: r.draft === true,
  };
}

/**
 * reports.json을 읽어 발행된 호만 최신순으로 반환.
 *
 * 리포트 앱 미배포 / reports.json 부재 / 네트워크 오류는 모두 빈 배열로 처리한다.
 * 1호 발행(2026-08-11) 전까지 이 경로로 엠티 스테이트가 노출된다.
 */
const fetchIssues = unstable_cache(
  async (): Promise<AiReportIssue[]> => {
    if (!REPORT_ORIGIN) return [];

    try {
      // 캐싱은 이 함수를 감싼 unstable_cache가 담당한다.
      // 여기서 cache 옵션을 지정하면 캐시 스코프와 충돌한다.
      const res = await fetch(`${REPORT_ORIGIN}/reports.json`);
      if (!res.ok) {
        console.error(`AI 리포트: reports.json 응답 ${res.status}`);
        return [];
      }

      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.reports;
      if (!Array.isArray(list)) {
        console.error("AI 리포트: reports.json 형식이 배열이 아님");
        return [];
      }

      return list
        .map(normalize)
        .filter((v): v is AiReportIssue => v !== null)
        .sort((a, b) => b.issue - a.issue);
    } catch (error) {
      // 리포트 앱 미배포 또는 일시 장애 — 엠티 스테이트로 폴백
      console.error("AI 리포트: reports.json 조회 실패", error);
      return [];
    }
  },
  ["ai-report-issues"],
  { revalidate: 600, tags: ["ai-report"] },
);

/** 발행일이 지난(=공개된) 호만 최신순으로 */
export async function getPublishedIssues(): Promise<AiReportIssue[]> {
  const all = await fetchIssues();
  const today = todayInKST();
  return all.filter((r) => !r.draft && r.publishedAt <= today);
}

/**
 * 아직 발행일이 오지 않은 호 중 가장 빠른 것.
 * 엠티 스테이트에서 "N호 · YYYY년 M월 D일 발행 예정"을 안내하는 데 쓴다.
 */
export async function getNextScheduledIssue(): Promise<AiReportIssue | null> {
  const all = await fetchIssues();
  const today = todayInKST();
  const upcoming = all
    .filter((r) => !r.draft && r.publishedAt > today)
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  return upcoming[0] ?? null;
}

/** 공개된 호 하나. 미발행/없는 호는 null */
export async function getPublishedIssue(
  issue: number,
): Promise<AiReportIssue | null> {
  const list = await getPublishedIssues();
  return list.find((r) => r.issue === issue) ?? null;
}

/** "1호" */
export function formatIssueLabel(issue: number): string {
  return `${issue}호`;
}

/** 목록용 짧은 날짜 — "2026.08.11" */
export function formatIssueDateShort(publishedAt: string): string {
  return publishedAt.replace(/-/g, ".");
}

/** 상세용 풀 날짜 — "2026년 8월 11일" (0 패딩 없음) */
export function formatIssueDateLong(publishedAt: string): string {
  const [y, m, d] = publishedAt.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
