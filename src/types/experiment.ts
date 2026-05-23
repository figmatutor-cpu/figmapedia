export interface KeyMetric {
  label: string;
  value: string;
}

export interface ExperimentMeta {
  slug: string;
  title: string;
  week: string;
  tool: string;
  tags: string[];
  summary: string;
  publishedAt: string;
  coverImage?: string;
  author?: string;
  keyMetrics?: KeyMetric[];
}

export interface Experiment extends ExperimentMeta {
  body: string;
}
