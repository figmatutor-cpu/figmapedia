import { fetchOgImage } from "@/lib/notion";

// 서버 메모리 캐시 — 인스턴스 내에서 재사용 (최대 500개, 24시간 TTL)
const ogCache = new Map<string, { url: string | null; expiresAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간
const MAX_CACHE_SIZE = 500;

function getCachedOg(key: string): string | null | undefined {
  const entry = ogCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    ogCache.delete(key);
    return undefined;
  }
  return entry.url;
}

function setCachedOg(key: string, url: string | null) {
  if (ogCache.size >= MAX_CACHE_SIZE) {
    // 가장 오래된 항목 삭제
    const firstKey = ogCache.keys().next().value;
    if (firstKey) ogCache.delete(firstKey);
  }
  ogCache.set(key, { url, expiresAt: Date.now() + CACHE_TTL });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "url parameter required" }, { status: 400 });
  }

  // 메모리 캐시 확인
  const cached = getCachedOg(targetUrl);
  if (cached !== undefined) {
    return Response.json(
      { ogImage: cached },
      {
        headers: {
          "Cache-Control": "public, max-age=86400", // 브라우저 24시간 캐시
        },
      }
    );
  }

  // OG 이미지 fetch
  const ogImage = (await fetchOgImage(targetUrl)) ?? null;
  setCachedOg(targetUrl, ogImage);

  return Response.json(
    { ogImage },
    {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    }
  );
}
