import type { HFModel } from "./hf";
import { promises as fs } from "fs";
import path from "path";

export type HistorySnapshot = {
  date: string;
  models: Record<string, { downloadsAllTime?: number; downloads?: number; likes?: number; trendingScore?: number }>;
};

const historyPath = path.join(process.cwd(), "data", "history.json");

export async function loadHistory(): Promise<HistorySnapshot[]> {
  try {
    const raw = await fs.readFile(historyPath, "utf-8");
    const data = JSON.parse(raw) as HistorySnapshot[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveSnapshot(models: HFModel[]) {
  const history = await loadHistory();
  const today = new Date().toISOString().slice(0, 10);
  if (history.some((snap) => snap.date === today)) return;

  const modelsMap: HistorySnapshot["models"] = {};
  models.forEach((model) => {
    modelsMap[model.id] = {
      downloadsAllTime: (model as HFModel & { downloadsAllTime?: number }).downloadsAllTime,
      downloads: model.downloads,
      likes: model.likes,
      trendingScore: model.trendingScore,
    };
  });

  history.push({ date: today, models: modelsMap });
  await fs.mkdir(path.dirname(historyPath), { recursive: true });
  await fs.writeFile(historyPath, JSON.stringify(history.slice(-120), null, 2));
}

export function getSeriesFromHistory(modelId: string, history: HistorySnapshot[], window = 30) {
  if (history.length < 2) return null;

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const series: number[] = [];

  for (let i = 1; i < sorted.length; i += 1) {
    const prevSnapshot = sorted[i - 1].models[modelId];
    const currentSnapshot = sorted[i].models[modelId];
    const prev = prevSnapshot?.downloadsAllTime ?? prevSnapshot?.downloads;
    const current = currentSnapshot?.downloadsAllTime ?? currentSnapshot?.downloads;
    if (prev === undefined || current === undefined) continue;
    series.push(Math.max(0, current - prev));
  }

  return series.length ? series.slice(-window) : null;
}

export function getHistoryStats(history: HistorySnapshot[]) {
  if (history.length === 0) {
    return { days: 0, firstDate: null as string | null, lastDate: null as string | null };
  }
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  return {
    days: sorted.length,
    firstDate: sorted[0].date,
    lastDate: sorted[sorted.length - 1].date,
  };
}
