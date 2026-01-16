import type { HFModelDetail } from "./hf";

export type BenchmarkEntry = {
  modelId: string;
  task?: string;
  dataset?: string;
  metric?: string;
  value?: number;
};

type ModelIndexMetric = {
  name?: string;
  type?: string;
  value?: number;
};

type ModelIndexResult = {
  dataset?: { name?: string; type?: string; config?: string };
  task?: { type?: string; name?: string };
  metrics?: ModelIndexMetric[];
};

type ModelIndexEntry = {
  results?: ModelIndexResult[];
};

const lowerIsBetter = ["loss", "perplexity", "wer", "cer", "error"]; 

function isHigherBetter(metric?: string) {
  if (!metric) return true;
  const name = metric.toLowerCase();
  return !lowerIsBetter.some((key) => name.includes(key));
}

export function extractBenchmarks(model: HFModelDetail): BenchmarkEntry[] {
  const entries: BenchmarkEntry[] = [];
  const modelIndex = model["model-index"] as ModelIndexEntry[] | undefined;
  if (!Array.isArray(modelIndex)) return entries;

  modelIndex.forEach((item) => {
    const results = Array.isArray(item?.results) ? item.results : [];
    results.forEach((result) => {
      const dataset = result?.dataset?.name ?? result?.dataset?.type ?? result?.dataset?.config;
      const task = result?.task?.type ?? result?.task?.name;
      const metrics = Array.isArray(result?.metrics) ? result.metrics : [];
      metrics.forEach((metric) => {
        if (metric?.value === undefined) return;
        entries.push({
          modelId: model.id,
          task,
          dataset,
          metric: metric.name ?? metric.type,
          value: metric.value,
        });
      });
    });
  });

  return entries;
}

export function selectBenchmarkHighlights(entries: BenchmarkEntry[], limit = 8) {
  const scored = entries
    .filter((entry) => entry.value !== undefined)
    .map((entry) => ({
      ...entry,
      score: isHigherBetter(entry.metric) ? entry.value ?? 0 : -(entry.value ?? 0),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return scored.slice(0, limit);
}
