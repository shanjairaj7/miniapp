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
    <div className="min-h-screen bg-[color:var(--paper)]">
      <Masthead updatedAt={updatedAt} />

      {/* Hero Section - The Hook */}
      <section className="border-b border-[color:var(--border)] bg-gradient-to-b from-white to-[color:var(--paper)]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[color:var(--accent)]"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--accent)]"></span>
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
              Live Data • Updated Today
            </p>
          </div>

          <h1 className="text-5xl font-bold leading-tight text-[color:var(--ink)] md:text-6xl">
            Know what's happening in <span className="text-[color:var(--accent)]">AI right now</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--muted)]">
            Stop guessing about emerging models. Watch the frontier evolve in real-time. See what researchers are building, which models are accelerating, and what's about to matter.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/trends">Start Exploring →</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/papers">Read Latest Research</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-[color:var(--muted)]">
            {historyStats.days}+ days of momentum data • {scored.length}+ models tracked • Daily updates
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        {/* What's Happening - The Narrative */}
        <section className="py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">Right Now</p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">What's moving the needle today</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Breakouts */}
            <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent-2)]">
                  🚀 Accelerating
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Models Gaining Traction</p>
              </div>
              <p className="text-sm text-[color:var(--muted)]">
                {breakoutFocus.length > 0
                  ? `${breakoutFocus.length} models breaking out this week`
                  : "Watch for models that are accelerating"}
              </p>
              <div className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4">
                {breakoutFocus.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.id}`}
                    className="group block rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-[color:var(--accent)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)]"
                  >
                    <span className="group-hover:underline">{model.id}</span>
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      +{formatNumber(model.acceleration, 0)}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* New Models */}
            <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent-3)]">
                  ✨ New
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Fresh Arrivals</p>
              </div>
              <p className="text-sm text-[color:var(--muted)]">
                {newFocus.length > 0 ? `${newFocus.length} models debuted this week` : "First look at new models"}
              </p>
              <div className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4">
                {newFocus.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.id}`}
                    className="group block rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-[color:var(--accent)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)]"
                  >
                    <span className="group-hover:underline">{model.id}</span>
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      {formatNumber(model.velocity, 1)}/day
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Signal Briefing */}
            <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                  📊 Signals
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Momentum Briefing</p>
              </div>
              {coolingCategory || trendingCategory ? (
                <p className="text-sm text-[color:var(--muted)]">
                  {coolingCategory && (
                    <>
                      <span className="font-medium text-[color:var(--ink)]">{coolingCategory}</span> is cooling — shift
                      coming?
                    </>
                  )}
                  {trendingCategory && !coolingCategory && (
                    <>
                      <span className="font-medium text-[color:var(--ink)]">{trendingCategory}</span> is the hottest
                      category right now
                    </>
                  )}
                </p>
              ) : (
                <p className="text-sm text-[color:var(--muted)]">Building signal data... Check back soon</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--border)] pt-4">
                {trendingList.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    href={`/categories/${tag}`}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  >
                    {tagLabelMap[tag] ?? tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Frontier Models - The Main Event */}
        <section className="border-y border-[color:var(--border)] py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">Top Tier</p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">Models you should know about</h2>
            <p className="mt-2 text-[color:var(--muted)]">Ranked by frontier score — what really matters</p>
          </div>

          <div className="space-y-3">
            {frontierModels.map((model, idx) => (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                className="group relative overflow-hidden rounded-[16px] border border-[color:var(--border)] bg-white shadow-sm transition hover:border-[color:var(--accent)] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-6 p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--paper-2)] text-sm font-bold text-[color:var(--ink)]">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
                          {model.id}
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {formatNumber(model.velocity, 1)} downloads/day •{" "}
                          <span className="font-medium text-[color:var(--accent-2)]">
                            {formatNumber(model.lift, 1)}x lift
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden flex-col items-end sm:flex">
                      <Badge variant="secondary">{model.trendLabel}</Badge>
                      <p className="mt-2 text-xs text-[color:var(--muted)]">
                        {formatNumber(model.momentumRatio * 100, 0)}% momentum
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Button asChild variant="outline" className="mt-8 w-full">
            <Link href="/trends">Explore Full Leaderboard →</Link>
          </Button>
        </section>

        {/* Research & Implementation */}
        <section className="py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Papers */}
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
                  Research
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[color:var(--ink)]">Latest from arXiv</h3>
              </div>
              {leadPaper ? (
                <div className="rounded-[16px] border border-[color:var(--border)] bg-white shadow-sm">
                  <PaperBridgeCard
                    paper={leadPaper.paper}
                    repos={leadPaper.repos}
                    citations={leadPaper.citations}
                  />
                </div>
              ) : (
                <div className="rounded-[14px] border border-[color:var(--border)] bg-[color:var(--paper-2)] p-8 text-center">
                  <p className="text-sm text-[color:var(--muted)]">Loading latest papers...</p>
                </div>
              )}
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/papers">More Papers →</Link>
              </Button>
            </div>

            {/* Deployable */}
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
                  Ready to Use
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[color:var(--ink)]">Frontier models you can run</h3>
              </div>
              <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold text-[color:var(--accent)]">{deployableModels.length}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Top models with live inference endpoints, quantized versions, or commercial APIs ready to go
                </p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--border)] pt-4">
                  {deployableModels.slice(0, 3).map((model) => (
                    <Link
                      key={model.id}
                      href={`/models/${model.id}`}
                      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-2 text-xs font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                    >
                      {model.id}
                    </Link>
                  ))}
                  {deployableModels.length > 3 && (
                    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-2 text-xs font-medium text-[color:var(--muted)]">
                      +{deployableModels.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="border-t border-[color:var(--border)] py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
              Momentum Signals
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">
              {showDaily ? "What shifted today" : "Baseline momentum"}
            </h2>
            <p className="mt-2 text-[color:var(--muted)]">
              {showDaily
                ? "Real day-over-day velocity changes — see the shifts as they happen"
                : "Initial breakout velocity vs. historical baseline — early indicators of strength"}
            </p>
          </div>
          <div className="rounded-[16px] border border-[color:var(--border)] bg-white p-6 shadow-sm">
            {showDaily ? <DailyDeltaChart models={scored} /> : <LiftLadderChart models={scored} />}
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-[color:var(--border)] py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">Categories</p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">Which domains are accelerating</h2>
          </div>
          <CategoryPanel groups={groups} />
        </section>

        {/* CTA Section */}
        <section className="border-t border-[color:var(--border)] py-16 text-center">
          <h2 className="text-3xl font-bold text-[color:var(--ink)]">Stay ahead of the frontier</h2>
          <p className="mt-4 text-lg text-[color:var(--muted)]">
            Bookmark this. Check it daily. Know what matters before everyone else.
          </p>
          <Button size="lg" asChild className="mt-8">
            <Link href="/trends">Dive into the data →</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
