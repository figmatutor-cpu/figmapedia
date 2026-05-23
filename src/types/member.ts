export type MemberRole = "free" | "member" | "admin";

export const MEMBER_ROLES_PAID: ReadonlyArray<MemberRole> = ["member", "admin"];

export function isPaidRole(role: MemberRole | null | undefined): boolean {
  return role === "member" || role === "admin";
}

export function readRoleFromJwt(
  appMetadata: Record<string, unknown> | undefined,
): MemberRole {
  const raw = appMetadata?.role;
  if (raw === "member" || raw === "admin" || raw === "free") return raw;
  return "free";
}
