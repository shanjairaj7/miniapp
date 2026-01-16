import Masthead from "@/components/Masthead";
import ModelFeatureCard from "@/components/ModelFeatureCard";
import PaperBridgeCard from "@/components/PaperBridgeCard";
import CategoryPanel from "@/components/CategoryPanel";
import LiftLadderChart from "@/components/charts/LiftLadderChart";
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
import { isDeployable } from "@/lib/signals";
import { getOpenAlexWorkByArxivId } from "@/lib/openalex";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    .slice(0, 6);
  const breakouts = [...scored]
    .filter((model) => model.acceleration > 0)
    .sort((a, b) => b.acceleration - a.acceleration)
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

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const categoryCooling = groups
    .map((group) => {
      const groupModels = scored.filter((model) =>
        group.tags.some((tag) => tag.id === model.pipeline_tag)
      );
      const withHistory = groupModels.filter((model) => model.series.length > 0);
      const score = average(withHistory.map((model) => model.decayScore));
      return { label: group.label, score, count: withHistory.length };
    })
    .filter((group) => group.count > 0)
    .sort((a, b) => a.score - b.score);

  const detailModels = await getModelInfos(
    frontierModels.map((model) => model.id),
    "inferenceProviderMapping"
  );
  const deployableModels = detailModels.filter(isDeployable).slice(0, 6);

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

  const breakoutFocus = breakouts.slice(0, 3);
  const newFocus = newModels.slice(0, 3);
  const leadPaper =
    paperBridge
      .slice()
      .sort((a, b) => b.repos.length - a.repos.length || (b.citations ?? 0) - (a.citations ?? 0))[0] ??
    null;
  const showDaily = scored.some((model) => model.series.length > 0);
  const coolingCategory = categoryCooling[0]?.label ?? null;
  const trendingCategory = trendingList[0] ? tagLabelMap[trendingList[0]] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[color:var(--paper)] via-white to-[color:var(--paper)]">
      <Masthead updatedAt={updatedAt} />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
              Updated {formatDate(updatedAt)}
            </p>
          </div>
          <h2 className="text-4xl font-bold text-[color:var(--ink)] md:text-5xl">
            The AI Model Frontier, Live
          </h2>
          <p className="mt-4 text-lg text-[color:var(--muted)]">
            Real-time insights into breakthrough models, emerging research, and what's gaining momentum.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/trends">Explore Dashboard</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/papers">Latest Research</Link>
            </Button>
          </div>
        </section>

        {/* Quick Insights Grid */}
        <section className="mb-16">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    🚀 Breakouts
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[color:var(--ink)]">{breakoutFocus.length}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Models gaining momentum</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {breakoutFocus.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.id}`}
                    className="block truncate text-sm font-semibold text-[color:var(--accent)] hover:underline"
                  >
                    {model.id}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    ✨ Fresh Arrivals
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[color:var(--ink)]">{newFocus.length}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">New models this week</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {newFocus.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.id}`}
                    className="block truncate text-sm font-semibold text-[color:var(--accent)] hover:underline"
                  >
                    {model.id}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    📊 Insights
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[color:var(--ink)]">{historyStats.days}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Days of momentum data</p>
                </div>
              </div>
              <div className="mt-4">
                {coolingCategory ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    <span className="font-semibold text-[color:var(--ink)]">{coolingCategory}</span> is cooling
                  </p>
                ) : trendingCategory ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    <span className="font-semibold text-[color:var(--ink)]">{trendingCategory}</span> is surging
                  </p>
                ) : (
                  <p className="text-sm text-[color:var(--muted)]">Building data...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="mb-16 grid gap-8 lg:grid-cols-3">
          {/* Frontier Models */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Frontier Models</h3>
              <p className="mt-1 text-[color:var(--muted)]">
                The highest-scoring models by frontierScore metrics
              </p>
            </div>
            <div className="space-y-3">
              {frontierModels.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="group block rounded-[14px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-sm transition hover:border-[color:var(--accent)] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
                        {model.id}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{model.trendLabel}</Badge>
                        <span className="text-xs text-[color:var(--muted)]">
                          {formatNumber(model.velocity, 1)}/day
                        </span>
                        <span className="text-xs font-semibold text-[color:var(--accent-2)]">
                          ↑ {formatNumber(model.lift, 1)}x
                        </span>
                        <span className="text-xs text-[color:var(--muted)]">
                          {formatNumber(model.momentumRatio * 100, 0)}% momentum
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/models/${model.id}`}>View</Link>
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href="/trends">See All Models →</Link>
              </Button>
            </div>
          </div>

          {/* Research Spotlight */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Research Spotlight</h3>
              <p className="mt-1 text-[color:var(--muted)]">Featured papers with impact</p>
            </div>
            {leadPaper ? (
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
                <PaperBridgeCard
                  paper={leadPaper.paper}
                  repos={leadPaper.repos}
                  citations={leadPaper.citations}
                />
              </div>
            ) : (
              <div className="rounded-[14px] border border-[color:var(--border)] bg-[color:var(--paper-2)] p-6 text-center">
                <p className="text-sm text-[color:var(--muted)]">Loading research data...</p>
              </div>
            )}
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/papers">Browse Papers →</Link>
            </Button>
          </div>
        </section>

        {/* Momentum Charts */}
        <section className="mb-16">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[color:var(--ink)]">{showDaily ? "Daily Changes" : "Momentum Baseline"}</h3>
            <p className="mt-1 text-[color:var(--muted)]">
              {showDaily
                ? "Real day-over-day velocity shifts across the frontier"
                : "Initial breakout speed vs. historical baseline"}
            </p>
          </div>
          <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            {showDaily ? <DailyDeltaChart models={scored} /> : <LiftLadderChart models={scored} />}
          </div>
        </section>

        {/* Categories Explore */}
        <section className="mb-16">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[color:var(--ink)]">Explore by Category</h3>
            <p className="mt-1 text-[color:var(--muted)]">
              See which domains are accelerating or cooling down
            </p>
          </div>
          <CategoryPanel groups={groups} />
        </section>

        {/* Key Metrics */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--card)] to-[color:var(--paper-2)] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                Ready to Deploy
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--accent)]">{deployableModels.length}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Models with live inference endpoints & formats
              </p>
            </div>
            <div className="rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--card)] to-[color:var(--paper-2)] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                Paper-to-Code Bridge
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--accent-2)]">{paperBridge.length}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Daily papers linked to implementations & repos
              </p>
            </div>
            <div className="rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--card)] to-[color:var(--paper-2)] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                Trending Categories
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--accent-3)]">{trendingList.length}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Active domains by momentum score
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
