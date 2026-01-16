import Masthead from "@/components/Masthead";
import LiftLadderChart from "@/components/charts/LiftLadderChart";
import MomentumShareChart from "@/components/charts/MomentumShareChart";
import CategoryVelocityChart from "@/components/charts/CategoryVelocityChart";
import DailyDeltaChart from "@/components/charts/DailyDeltaChart";
import { getModelTagsByType, getTrendingModels } from "@/lib/hf";
import { scoreModels } from "@/lib/score";
import { groupPipelineTags } from "@/lib/categories";
import { getHistoryStats, getSeriesFromHistory, loadHistory } from "@/lib/history";

export default async function TrendsPage() {
  const [models, tagsByType, history] = await Promise.all([
    getTrendingModels(80),
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

  const categoryVelocity = groups
    .map((group) => {
      const groupModels = scored.filter((model) =>
        group.tags.some((tag) => tag.id === model.pipeline_tag)
      );
      const velocity = groupModels.reduce((sum, model) => sum + model.velocity, 0);
      return { label: group.label, velocity };
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 8);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={updatedAt} />

      <section className="grid gap-6 md:grid-cols-2">
        <LiftLadderChart models={scored} />
        <MomentumShareChart models={scored} />
        <CategoryVelocityChart rows={categoryVelocity} />
        <DailyDeltaChart models={scored} />
      </section>
    </div>
  );
}
