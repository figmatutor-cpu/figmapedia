import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data: post } = await supabase
    .from("community_posts")
    .select("title, content, category")
    .eq("id", id)
    .single();

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  const description = post.content
    ? post.content.slice(0, 120).replace(/\n/g, " ")
    : `${post.category} 게시글`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/community/${id}` },
    openGraph: {
      title: `${post.title} | Figmapedia 커뮤니티`,
      description,
      url: `/community/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${post.title} | Figmapedia 커뮤니티`,
      description,
    },
  };
}

export default function CommunityPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
