import Masthead from "@/components/Masthead";
import ModelFeatureCard from "@/components/ModelFeatureCard";
import SignalColumn from "@/components/SignalColumn";
import PaperBridgeCard from "@/components/PaperBridgeCard";
import DeployabilityList from "@/components/DeployabilityList";
import BenchmarkTable from "@/components/BenchmarkTable";
import CategoryPanel from "@/components/CategoryPanel";
import LiftLadderChart from "@/components/charts/LiftLadderChart";
import MomentumShareChart from "@/components/charts/MomentumShareChart";
import CategoryVelocityChart from "@/components/charts/CategoryVelocityChart";
import DailyDeltaChart from "@/components/charts/DailyDeltaChart";
import {
  getDailyPapers,
  getModelInfos,
  getModelTagsByType,
  getPaperRepos,
  getTrendingModels,
} from "@/lib/hf";
import { groupPipelineTags } from "@/lib/categories";
import { scoreModels } from "@/lib/score";
import { formatDate, formatNumber } from "@/lib/utils";
import { getHistoryStats, getSeriesFromHistory, loadHistory } from "@/lib/history";
import { extractBenchmarks, selectBenchmarkHighlights } from "@/lib/benchmarks";
import { isDeployable } from "@/lib/signals";
import { getOpenAlexWorkByArxivId } from "@/lib/openalex";
import Link from "next/link";

export default async function HomePage() {
  const [models, papers, tagsByType, history] = await Promise.all([
    getTrendingModels(60),
    getDailyPapers(),
    getModelTagsByType(),
    loadHistory(),
  ]);
  const historyStats = getHistoryStats(history);
  const updatedAt = historyStats.lastDate ?? new Date().toISOString();

  const historySeries = Object.fromEntries(
    models
      .map((model) => [model.id, getSeriesFromHistory(model.id, history)])
      .filter(([, series]) => series && series.length)
  );
  const scored = scoreModels(models, historySeries);
  const pipelineTags = tagsByType.pipeline_tag ?? [];
  const groups = groupPipelineTags(pipelineTags);
  const tagLabelMap = Object.fromEntries(pipelineTags.map((tag) => [tag.id, tag.label]));

  const frontierModels = [...scored]
    .sort((a, b) => b.frontierScore - a.frontierScore)
    .slice(0, 12);
  const breakouts = [...scored]
    .filter((model) => model.acceleration > 0)
    .sort((a, b) => b.acceleration - a.acceleration)
    .slice(0, 5);
  const cooling = [...scored]
    .filter((model) => model.decayScore < 0)
    .sort((a, b) => a.decayScore - b.decayScore)
    .slice(0, 5);
  const newModels = [...scored]
    .filter((model) => model.recencyDays <= 7)
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 5);

  const trendingCategories = scored
    .filter((model) => model.pipeline_tag)
    .reduce((acc, model) => {
      const key = model.pipeline_tag!;
      acc[key] = (acc[key] ?? 0) + model.velocity;
      return acc;
    }, {} as Record<string, number>);

  const trendingList = Object.entries(trendingCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  const categoryVelocity = groups
    .map((group) => {
      const groupModels = scored.filter((model) =>
        group.tags.some((tag) => tag.id === model.pipeline_tag)
      );
      const velocity = groupModels.reduce((sum, model) => sum + model.velocity, 0);
      return { label: group.label, velocity };
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 6);

  const detailModels = await getModelInfos(
    frontierModels.map((model) => model.id),
    "inferenceProviderMapping"
  );
  const deployableModels = detailModels.filter(isDeployable).slice(0, 6);
  const benchmarkEntries = selectBenchmarkHighlights(
    detailModels.flatMap((model) => extractBenchmarks(model)),
    8
  );

  const paperBridge = await Promise.all(
    papers.slice(0, 3).map(async (paper) => {
      const id = paper.paper?.id ?? paper.id;
      const [repos, openalex] = await Promise.all([
        id ? getPaperRepos(id).catch(() => []) : Promise.resolve([]),
        id ? getOpenAlexWorkByArxivId(id).catch(() => null) : Promise.resolve(null),
      ]);
      return { paper, repos, citations: openalex?.cited_by_count ?? null };
    })
  );

  const formatSignedPercent = (value: number) =>
    `${value > 0 ? "+" : ""}${formatNumber(value * 100, 0)}%`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={updatedAt} />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[color:var(--ink)]">Frontier Signals</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <span>{formatDate(updatedAt)}</span>
              <span>{historyStats.days > 0 ? `${historyStats.days} snapshots` : "No snapshots yet"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingList.map((tag) => (
              <Link
                key={tag}
                href={`/categories/${tag}`}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
              >
                {tagLabelMap[tag] ?? tag}
              </Link>
            ))}
            <Link
              href="/categories"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]"
            >
              View all categories
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SignalColumn
            title="Breakouts"
            description="Fastest acceleration vs historical baseline."
            models={breakouts}
            metric={(model) => formatSignedPercent(model.acceleration)}
          />
          <SignalColumn
            title="Cooling"
            description="Momentum falling below historical baseline."
            models={cooling}
            metric={(model) => formatSignedPercent(model.decayScore)}
          />
          <SignalColumn
            title="New arrivals"
            description="Newest models with real traction."
            models={newModels}
            metric={(model) => `${formatNumber(model.velocity, 1)}/day`}
          />
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Featured Models</h3>
          <Link
            href="/trends"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]"
          >
            View dashboard
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {frontierModels.map((model) => (
            <ModelFeatureCard key={model.id} model={model} />
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Insight Charts</h3>
          <Link
            href="/trends"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]"
          >
            View dashboard
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <LiftLadderChart models={scored} />
          <MomentumShareChart models={scored} />
          <CategoryVelocityChart rows={categoryVelocity} />
          <DailyDeltaChart models={scored} />
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Ready to Ship</h3>
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Providers & formats
          </span>
        </div>
        <div className="mt-5">
          <DeployabilityList models={deployableModels} />
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Benchmark Highlights</h3>
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Extracted from model-index
          </span>
        </div>
        <div className="mt-5">
          <BenchmarkTable entries={benchmarkEntries} />
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Research → Models</h3>
          <Link
            href="/papers"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]"
          >
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {paperBridge.map(({ paper, repos, citations }) => (
            <PaperBridgeCard
              key={paper.paper?.id ?? paper.id}
              paper={paper}
              repos={repos}
              citations={citations}
            />
          ))}
        </div>
      </section>

      <CategoryPanel groups={groups} />
    </div>
  );
}
