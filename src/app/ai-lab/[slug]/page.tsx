import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportFooter } from "@/components/ai-lab/ReportFooter";
import { ReportMemberContent } from "@/components/ai-lab/ReportMemberContent";
import { ReportMeta } from "@/components/ai-lab/ReportMeta";
import { ReportSummary } from "@/components/ai-lab/ReportSummary";
import { getAllExperiments, getExperimentBySlug } from "@/lib/mdx/experiments";

export const revalidate = 3600;

export async function generateStaticParams() {
  const experiments = await getAllExperiments();
  return experiments.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experiment = await getExperimentBySlug(slug);
  if (!experiment) return {};

  const description = experiment.summary
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: `${experiment.title} | AI 실험실 | Figmapedia`,
    description,
    openGraph: {
      title: experiment.title,
      description,
      type: "article",
      publishedTime: experiment.publishedAt,
      authors: experiment.author ? [experiment.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: experiment.title,
      description,
    },
  };
}

export default async function ExperimentReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = await getExperimentBySlug(slug);
  if (!experiment) notFound();

  const all = await getAllExperiments();
  const idx = all.findIndex((e) => e.slug === slug);
  const next = idx > 0 ? all[idx - 1] : null;
  const prev = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: experiment.title,
    datePublished: experiment.publishedAt,
    author: experiment.author
      ? { "@type": "Person", name: experiment.author }
      : undefined,
    isAccessibleForFree: false,
    hasPart: {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".member-only-content",
    },
  };

  return (
    <main className="min-h-screen bg-base">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="container mx-auto max-w-4xl px-6 py-10 md:py-14">
        <nav className="mb-8 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/ai-lab" className="transition hover:text-gray-300">
            AI 실험실
          </Link>
          <span aria-hidden>›</span>
          <span className="text-gray-400">리포트</span>
        </nav>

        <ReportMeta experiment={experiment} />

        <ReportSummary experiment={experiment} />

        <div className="member-only-content">
          <ReportMemberContent slug={slug} />
        </div>

        <ReportFooter prev={prev} next={next} />
      </div>
    </main>
  );
}
