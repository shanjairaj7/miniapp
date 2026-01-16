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
    .slice(0, 20);
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
    <div className="min-h-screen bg-[color:var(--paper)]">
      <Masthead updatedAt={updatedAt} />

      {/* Hero Section with Bold Title */}
      <section className="border-b border-[color:var(--border)] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-mono text-5xl font-black leading-tight text-[color:var(--ink)] md:text-6xl lg:text-7xl">
            The frontier of AI models
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--muted)]">
            Real-time leaderboard of what's breaking through. Track momentum, velocity, and adoption across the entire
            model ecosystem.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        {/* Leaderboard Section - Main Focus */}
        <section className="py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--ink)]">Leaderboard</h2>
              <p className="mt-1 text-[color:var(--muted)]">Ranked by frontier score</p>
            </div>
            <div className="flex gap-2">
              <select className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)]">
                <option>Frontier Score</option>
                <option>Downloads/Day</option>
                <option>Momentum</option>
              </select>
              <select className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)]">
                <option>All time</option>
                <option>This week</option>
                <option>Today</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    Model
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] sm:table-cell">
                    Velocity
                  </th>
                  <th className="hidden px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] lg:table-cell">
                    Lift
                  </th>
                  <th className="hidden px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] lg:table-cell">
                    Momentum
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {frontierModels.slice(0, 10).map((model, idx) => (
                  <tr
                    key={model.id}
                    className="border-b border-[color:var(--border)] transition hover:bg-[color:var(--paper-2)]"
                  >
                    <td className="px-6 py-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--paper-2)] font-bold text-[color:var(--ink)]">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[color:var(--ink)]">{model.id}</p>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">{model.trendLabel}</p>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <p className="font-semibold text-[color:var(--ink)]">{formatNumber(model.velocity, 1)}</p>
                      <p className="text-xs text-[color:var(--muted)]">/day</p>
                    </td>
                    <td className="hidden px-6 py-4 text-right lg:table-cell">
                      <span className="inline-block rounded-full bg-[color:var(--paper-2)] px-3 py-1 font-semibold text-[color:var(--accent-2)]">
                        {formatNumber(model.lift, 1)}x
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-right lg:table-cell">
                      <p className="font-medium text-[color:var(--ink)]">{formatNumber(model.momentumRatio * 100, 0)}%</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/models/${model.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/trends">View All {frontierModels.length} Models →</Link>
          </Button>
        </section>

        {/* Quick Stats */}
        <section className="border-t border-[color:var(--border)] py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[14px] border border-[color:var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                🚀 Breakouts
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--accent-2)]">{breakoutFocus.length}</p>
              <div className="mt-3 space-y-1">
                {breakoutFocus.map((m) => (
                  <Link key={m.id} href={`/models/${m.id}`} className="block text-sm text-[color:var(--accent)] hover:underline">
                    {m.id}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[color:var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                ✨ New
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--accent-3)]">{newFocus.length}</p>
              <div className="mt-3 space-y-1">
                {newFocus.map((m) => (
                  <Link key={m.id} href={`/models/${m.id}`} className="block text-sm text-[color:var(--accent)] hover:underline">
                    {m.id}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[color:var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                📚 Research
              </p>
              <p className="mt-3 text-3xl font-bold text-[color:var(--ink)]">{paperBridge.length}</p>
              <p className="mt-3 text-sm text-[color:var(--muted)]">Latest papers with code links</p>
              <Button variant="outline" size="sm" asChild className="mt-3 w-full">
                <Link href="/papers">View Papers</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="border-t border-[color:var(--border)] py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[color:var(--ink)]">
              {showDaily ? "Daily Changes" : "Momentum Signals"}
            </h2>
          </div>
          <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
            {showDaily ? <DailyDeltaChart models={scored} /> : <LiftLadderChart models={scored} />}
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-[color:var(--border)] py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--ink)]">By Category</h2>
          </div>
          <CategoryPanel groups={groups} />
        </section>
      </div>
    </div>
  );
}
