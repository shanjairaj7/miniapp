import type { HFModel } from "./hf";
import { clamp } from "./utils";

export type ScoredModel = HFModel & {
  velocity: number;
  acceleration: number;
  recencyDays: number;
  baselineVelocity: number;
  lift: number;
  frontierScore: number;
  momentumRatio: number;
  trendLabel: "Breakout" | "Cooling" | "New" | "Steady";
  series: number[];
  decayScore: number;
};

function daysSince(value?: string) {
  if (!value) return 999;
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computeDecay(series: number[]) {
  if (series.length < 4) return 0;
  const midpoint = Math.floor(series.length / 2);
  const first = series.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
  const second = series.slice(midpoint).reduce((a, b) => a + b, 0) / (series.length - midpoint);
  return clamp((second - first) / Math.max(first, 1), -1, 1);
}

function computeVelocity(series: number[], fallback: number) {
  if (!series.length) return fallback;
  const window = Math.min(7, series.length);
  return average(series.slice(-window));
}

function computeAcceleration(series: number[], fallback: number) {
  if (series.length < 6) return fallback;
  const recent = average(series.slice(-3));
  const previous = average(series.slice(-6, -3));
  return clamp((recent - previous) / Math.max(previous, 1), -1, 1);
}

export function scoreModels(models: HFModel[], historySeries?: Record<string, number[]>) {
  const velocityById = new Map<string, number>();
  const seriesById = new Map<string, number[]>();

  models.forEach((model) => {
    const series = historySeries?.[model.id] ?? [];
    seriesById.set(model.id, series);
    velocityById.set(model.id, computeVelocity(series, (model.downloads ?? 0) / 30));
  });

  const maxVelocity = Math.max(...Array.from(velocityById.values()), 1);
  const maxLikes = Math.max(...models.map((m) => m.likes ?? 0), 1);
  const maxTrending = Math.max(...models.map((m) => m.trendingScore ?? 0), 1);

  return models.map((model) => {
    const downloads = model.downloads ?? 0;
    const downloadsAllTime = model.downloadsAllTime ?? 0;
    const velocity = velocityById.get(model.id) ?? downloads / 30;
    const ageDays = Math.max(1, daysSince(model.createdAt || model.lastModified));
    const recencyDays = Math.min(ageDays, 60);
    const recencyBoost = 1 - recencyDays / 60;
    const trendingScore = model.trendingScore ?? 0;
    const acceleration = computeAcceleration(
      seriesById.get(model.id) ?? [],
      clamp(trendingScore / Math.max(downloads, 1) - 0.05, -1, 1)
    );
    const momentumRatio =
      downloadsAllTime > 0 ? clamp((velocity * 30) / downloadsAllTime, 0, 1) : 0;
    const baselineVelocity = downloadsAllTime > 0 ? downloadsAllTime / ageDays : 0;
    const lift = baselineVelocity > 0 ? velocity / baselineVelocity : 0;
    const series = seriesById.get(model.id) ?? [];
    const decayScore = computeDecay(series);

    const frontierScore =
      0.4 * (velocity / maxVelocity) +
      0.2 * (trendingScore / maxTrending) +
      0.2 * (model.likes ?? 0) / maxLikes +
      0.1 * recencyBoost +
      0.1 * clamp(momentumRatio * 4, 0, 1);

    let trendLabel: ScoredModel["trendLabel"] = "Steady";
    if (recencyDays <= 5 && velocity > maxVelocity / 6) trendLabel = "New";
    if (acceleration > 0.2 && velocity > maxVelocity / 8) trendLabel = "Breakout";
    if (decayScore < -0.15) trendLabel = "Cooling";

    return {
      ...model,
      velocity,
      acceleration,
      recencyDays,
      baselineVelocity,
      lift,
      frontierScore,
      momentumRatio,
      trendLabel,
      series,
      decayScore,
    };
  });
}
