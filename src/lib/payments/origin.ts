import { NextResponse, type NextRequest } from "next/server";

/**
 * CSRF 1차 방어: 결제 관련 mutation 라우트에서 Origin 헤더가
 * 사이트 origin과 일치하는지 검증.
 *
 * NEXT_PUBLIC_SITE_URL이 비어 있으면(로컬 dev 등) 검증을 건너뛴다.
 * 프로덕션에는 반드시 설정되어 있어야 한다.
 */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (!expected) return null;

  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json(
      { error: "Origin header required" },
      { status: 403 },
    );
  }

  try {
    const reqOrigin = new URL(origin).origin;
    const expectedOrigin = new URL(expected).origin;
    if (reqOrigin !== expectedOrigin) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  return null;
}
