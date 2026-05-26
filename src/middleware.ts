import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPaidRole, readRoleFromJwt } from "@/types/member";

const AUTH_ONLY_PREFIXES = [
  "/membership/success",
  "/community/write",
  "/api/payments",
  "/api/mypage/discord-id",
];

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAdminPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

/**
 * Open redirect 방지: next 값은 내부 경로만 허용.
 * - 반드시 "/"로 시작
 * - "//" 또는 "/\"로 시작하면 외부 URL로 해석될 수 있어 거부
 */
function sanitizeNext(fullPath: string): string {
  if (!fullPath.startsWith("/")) return "/";
  if (fullPath.startsWith("//") || fullPath.startsWith("/\\")) return "/";
  return fullPath;
}

function jsonUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function jsonForbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const fullPath = sanitizeNext(`${pathname}${search}`);
  const apiRoute = isApiPath(pathname);

  if (!user) {
    if (apiRoute) return jsonUnauthorized();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = `?next=${encodeURIComponent(fullPath)}`;
    return NextResponse.redirect(loginUrl);
  }

  const role = readRoleFromJwt(user.app_metadata);

  if (isAdminPath(pathname)) {
    if (role !== "admin") {
      if (apiRoute) return jsonForbidden("Admin only");
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
    return response;
  }

  if (isAuthOnly(pathname)) {
    return response;
  }

  if (!isPaidRole(role)) {
    if (apiRoute) return jsonForbidden("Member only");
    const membershipUrl = request.nextUrl.clone();
    membershipUrl.pathname = "/membership";
    membershipUrl.search = `?reason=member_only&next=${encodeURIComponent(fullPath)}`;
    return NextResponse.redirect(membershipUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/study-room/:path*",
    "/ai-lab/vod/:path*",
    "/membership/success",
    "/mypage/:path*",
    "/admin/:path*",
    "/community/write",
    "/api/admin/:path*",
    "/api/mypage/:path*",
    "/api/payments/:path*",
  ],
};
