import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getExperimentBySlug } from "@/lib/mdx/experiments";
import { isPaidRole, readRoleFromJwt } from "@/types/member";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = readRoleFromJwt(user.app_metadata);
  if (!isPaidRole(role)) {
    return NextResponse.json({ error: "Member only" }, { status: 403 });
  }

  const { slug } = await params;
  const experiment = await getExperimentBySlug(slug);
  if (!experiment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      slug: experiment.slug,
      body: experiment.body,
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
