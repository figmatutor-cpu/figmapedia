import { TopicAdminPanel } from "@/components/admin/TopicAdminPanel";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  await requireAdmin();
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-h3-lg font-semibold text-fg-1">주제 투표</h2>
        <p className="mt-1 text-body text-fg-3">
          주간 후보 주제를 등록하고 상태를 관리합니다. winner 마킹 시 같은
          주차의 다른 candidate는 자동으로 archived 처리됩니다.
        </p>
      </header>
      <TopicAdminPanel />
    </div>
  );
}
