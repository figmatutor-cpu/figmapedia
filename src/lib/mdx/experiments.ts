import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Experiment, ExperimentMeta } from "@/types/experiment";

const EXPERIMENTS_DIR = path.join(process.cwd(), "content", "experiments");

function parseExperiment(filename: string, raw: string): Experiment {
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");

  return {
    slug,
    title: String(data.title ?? ""),
    week: String(data.week ?? ""),
    tool: String(data.tool ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    summary: String(data.summary ?? ""),
    publishedAt: String(data.publishedAt ?? ""),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    author: data.author ? String(data.author) : undefined,
    keyMetrics: Array.isArray(data.keyMetrics)
      ? data.keyMetrics
          .filter(
            (m): m is { label: unknown; value: unknown } =>
              typeof m === "object" && m !== null,
          )
          .map((m) => ({
            label: String(m.label ?? ""),
            value: String(m.value ?? ""),
          }))
          .filter((m) => m.label && m.value)
      : undefined,
    body: content.trim(),
  };
}

async function readExperimentFile(filename: string): Promise<Experiment> {
  const filePath = path.join(EXPERIMENTS_DIR, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return parseExperiment(filename, raw);
}

export async function getAllExperiments(): Promise<ExperimentMeta[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(EXPERIMENTS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const files = entries.filter((name) => name.endsWith(".mdx"));
  const experiments = await Promise.all(files.map(readExperimentFile));

  return experiments
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getExperimentBySlug(
  slug: string,
): Promise<Experiment | null> {
  const meta = await getAllExperiments();
  const found = meta.find((m) => m.slug === slug);
  if (!found) return null;

  const entries = await fs.readdir(EXPERIMENTS_DIR);
  const filename = entries.find((name) => {
    if (!name.endsWith(".mdx")) return false;
    return name === `${slug}.mdx` || name.replace(/\.mdx?$/, "") === slug;
  });

  if (filename) return readExperimentFile(filename);

  for (const entry of entries.filter((n) => n.endsWith(".mdx"))) {
    const exp = await readExperimentFile(entry);
    if (exp.slug === slug) return exp;
  }
  return null;
}

export async function getExperimentSlugs(): Promise<string[]> {
  const metas = await getAllExperiments();
  return metas.map((m) => m.slug);
}
