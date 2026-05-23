import { MemberAdminPanel } from "@/components/admin/MemberAdminPanel";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  await requireAdmin();
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">회원 관리</h2>
        <p className="mt-1 text-sm text-gray-400">
          역할 변경 시 해당 멤버의 세션이 무효화되어 다음 요청에서 재로그인이
          요구됩니다. 강제 해지는 결제 환불을 별도로 처리해야 합니다.
        </p>
      </header>
      <MemberAdminPanel />
    </div>
  );
}
