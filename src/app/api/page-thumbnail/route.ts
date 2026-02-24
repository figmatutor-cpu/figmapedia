import { fetchFirstImageUrl } from "@/lib/notion";

// 서버 메모리 캐시 — 인스턴스 내에서 재사용 (최대 500개, 45분 TTL)
// Notion S3 URL은 ~1시간 후 만료되므로 45분으로 안전 마진 확보
const thumbCache = new Map<string, { url: string | null; expiresAt: number }>();
const CACHE_TTL = 45 * 60 * 1000; // 45분
const MAX_CACHE_SIZE = 500;

function getCached(key: string): string | null | undefined {
  const entry = thumbCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    thumbCache.delete(key);
    return undefined;
  }
  return entry.url;
}

function setCached(key: string, url: string | null) {
  if (thumbCache.size >= MAX_CACHE_SIZE) {
    const firstKey = thumbCache.keys().next().value;
    if (firstKey) thumbCache.delete(firstKey);
  }
  thumbCache.set(key, { url, expiresAt: Date.now() + CACHE_TTL });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return Response.json({ error: "pageId parameter required" }, { status: 400 });
  }

  // 메모리 캐시 확인
  const cached = getCached(pageId);
  if (cached !== undefined) {
    return Response.json(
      { thumbnail: cached },
      {
        headers: {
          "Cache-Control": "public, max-age=2700", // 브라우저 45분 캐시
        },
      }
    );
  }

  // Notion 페이지 블록에서 첫 이미지 추출
  const thumbnail = (await fetchFirstImageUrl(pageId)) ?? null;
  setCached(pageId, thumbnail);

  return Response.json(
    { thumbnail },
    {
      headers: {
        "Cache-Control": "public, max-age=2700",
      },
    }
  );
}
