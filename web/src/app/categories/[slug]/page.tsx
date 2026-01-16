import Link from "next/link";
import Masthead from "@/components/Masthead";
import { getCategoryModels, getModelTagsByType } from "@/lib/hf";
import { scoreModels } from "@/lib/score";
import { formatNumber } from "@/lib/utils";
import { getHistoryStats, getSeriesFromHistory, loadHistory } from "@/lib/history";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const tag = resolved.slug;
  const [models, history, tagsByType] = await Promise.all([
    getCategoryModels(tag, 50),
    loadHistory(),
    getModelTagsByType(),
  ]);
  const historyStats = getHistoryStats(history);
  const updatedAt = historyStats.lastDate ?? new Date().toISOString();
  const label = tagsByType.pipeline_tag?.find((item) => item.id === tag)?.label ?? tag;
  const historySeries = Object.fromEntries(
    models
      .map((model) => [model.id, getSeriesFromHistory(model.id, history)])
      .filter(([, series]) => series && series.length)
  );
  const scored = scoreModels(models, historySeries);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={updatedAt} />

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Category</p>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{label}</h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]"
          >
            View all categories
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-[14px] border border-[color:var(--border)]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-[color:var(--paper-2)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            <span>Model</span>
            <span>30d downloads</span>
            <span>Avg / day</span>
            <span>Score</span>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {scored.slice(0, 20).map((model) => (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
              >
                <span className="font-semibold">{model.id}</span>
                <span>{formatNumber(model.downloads)}</span>
                <span>{formatNumber(model.velocity, 1)}</span>
                <span>{formatNumber(model.frontierScore * 100, 0)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
