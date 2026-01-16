const HF_BASE = "https://huggingface.co/api";

export type HFModel = {
  id: string;
  modelId: string;
  author?: string;
  pipeline_tag?: string;
  library_name?: string;
  tags?: string[];
  downloads?: number;
  downloadsAllTime?: number;
  likes?: number;
  trendingScore?: number;
  lastModified?: string;
  createdAt?: string;
  private?: boolean;
  gated?: boolean;
};

export type HFModelDetail = HFModel & {
  cardData?: Record<string, unknown>;
  config?: Record<string, unknown>;
  siblings?: { rfilename: string }[];
  "model-index"?: unknown[];
  evalResults?: unknown[];
  inferenceProviderMapping?: Record<string, { status?: string; provider_id?: string; task?: string }>;
  gguf?: { total?: number };
  widgetData?: unknown[];
  safetensors?: { parameters?: number; total?: number };
  inference?: string;
};

export type HFPaper = {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  thumbnail?: string;
  numComments?: number;
  submittedBy?: {
    fullname?: string;
    name?: string;
    avatarUrl?: string;
  };
  organization?: {
    name?: string;
    fullname?: string;
    avatar?: string;
  };
  paper?: {
    id: string;
    authors: { name: string }[];
    publishedAt?: string;
    title: string;
    summary?: string;
    upvotes?: number;
    ai_summary?: string;
    ai_keywords?: string[];
    githubRepo?: string;
    githubStars?: number;
  };
};

export type HFTag = {
  id: string;
  label: string;
  type: string;
  subType?: string;
};

const defaultRevalidate = 60 * 30;

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${HF_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function fetchJson<T>(url: string, revalidate = defaultRevalidate): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`HF request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getModels(params: {
  sort?: string;
  direction?: -1 | 1;
  limit?: number;
  filter?: string;
  search?: string;
  full?: boolean;
  expand?: string;
}) {
  const url = buildUrl("/models", {
    sort: params.sort,
    direction: params.direction,
    limit: params.limit ?? 40,
    filter: params.filter,
    search: params.search,
    full: params.full ?? true,
    expand: params.expand,
  });
  return fetchJson<HFModel[]>(url);
}

async function getModelsWithDownloadsAllTime(params: {
  sort?: string;
  direction?: -1 | 1;
  limit?: number;
  filter?: string;
  search?: string;
}) {
  const [full, expanded] = await Promise.all([
    getModels({ ...params, full: true }),
    getModels({ ...params, full: false, expand: "downloadsAllTime" }).catch(() => []),
  ]);
  const downloadsMap = new Map(expanded.map((model) => [model.id, model.downloadsAllTime]));
  return full.map((model) => ({
    ...model,
    downloadsAllTime: downloadsMap.get(model.id),
  }));
}

export async function getTrendingModels(limit = 40) {
  return getModelsWithDownloadsAllTime({
    sort: "trendingScore",
    direction: -1,
    limit,
  });
}

export async function getNewModels(limit = 40) {
  return getModelsWithDownloadsAllTime({
    sort: "createdAt",
    direction: -1,
    limit,
  });
}

export async function getCategoryModels(pipelineTag: string, limit = 40) {
  return getModelsWithDownloadsAllTime({
    filter: pipelineTag,
    sort: "downloads",
    direction: -1,
    limit,
  });
}

export async function getDailyPapers() {
  const url = buildUrl("/daily_papers");
  return fetchJson<HFPaper[]>(url, 60 * 60);
}

export async function getPaper(id: string) {
  const url = buildUrl(`/papers/${id}`);
  return fetchJson<HFPaper>(url, 60 * 60);
}

export async function getPaperRepos(id: string) {
  const url = buildUrl(`/arxiv/${id}/repos`);
  return fetchJson<{ type: string; repo: { id: string; type: string } }[]>(url, 60 * 60);
}

export async function getModelInfo(id: string, expand?: string) {
  const url = buildUrl(`/models/${id}`, expand ? { expand } : undefined);
  return fetchJson<HFModelDetail>(url, 60 * 60);
}

export async function getModelInfos(ids: string[], expand?: string) {
  const results = await Promise.allSettled(ids.map((id) => getModelInfo(id, expand)));
  return results
    .filter((result): result is PromiseFulfilledResult<HFModelDetail> => result.status === "fulfilled")
    .map((result) => result.value);
}

export async function getModelTagsByType() {
  const url = buildUrl("/models-tags-by-type");
  return fetchJson<Record<string, HFTag[]>>(url, 60 * 60 * 6);
}
