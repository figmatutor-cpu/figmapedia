import { FIGMA_RESOURCES, getResourcePageId } from "@/lib/resource-data";
import { getPageThumbnails } from "@/lib/thumbnail-cache";
import { FigmaResourceClient } from "./FigmaResourceClient";

/** 5분마다 Supabase 썸네일 재조회 (ISR) */
export const revalidate = 300;

export default async function FigmaResourcePage() {
  // 서버에서 Supabase 일괄 조회 → 클라이언트에 전달
  const pageIdToUrl = new Map<string, string>();
  for (const r of FIGMA_RESOURCES) {
    pageIdToUrl.set(getResourcePageId(r), r.url);
  }

  const allPageIds = [...pageIdToUrl.keys()];
  const thumbnailMap = await getPageThumbnails(allPageIds);

  // URL 기반 lookup으로 변환 (ResourceCard에서 resource.url로 조회)
  const cachedThumbnails: Record<string, string> = {};
  for (const [pageId, thumbnailUrl] of thumbnailMap) {
    const resourceUrl = pageIdToUrl.get(pageId);
    if (resourceUrl) {
      cachedThumbnails[resourceUrl] = thumbnailUrl;
    }
  }

  return <FigmaResourceClient cachedThumbnails={cachedThumbnails} />;
}
