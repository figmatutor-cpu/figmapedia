import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPaidRole, readRoleFromJwt } from "@/types/member";

const AUTH_ONLY_PREFIXES = ["/membership/success"];

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = `?next=${encodeURIComponent(fullPath)}`;
    return NextResponse.redirect(loginUrl);
  }

  const role = readRoleFromJwt(user.app_metadata);

  if (isAdminPath(pathname)) {
    if (role !== "admin") {
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
  ],
};
