import { VodAdminPanel } from "@/components/admin/VodAdminPanel";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminVodsPage() {
  await requireAdmin();
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-h3-lg font-semibold text-fg-1">라이브 / VOD</h2>
        <p className="mt-1 text-body text-fg-3">
          라이브 종료 후 YouTube Unlisted 영상 ID를 등록하면 멤버에게
          공개됩니다. 공개 토글로 임시 숨김 처리 가능.
        </p>
      </header>
      <VodAdminPanel />
    </div>
  );
}
