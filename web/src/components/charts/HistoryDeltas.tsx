import type { ScoredModel } from "@/lib/score";

export default function HistoryDeltas({ models }: { models: ScoredModel[] }) {
  const withHistory = models.filter((model) => model.series.length > 0).slice(0, 6);
  if (withHistory.length === 0) {
    return (
    <div className="rounded-[16px] border border-dashed border-[color:var(--border)] bg-[color:var(--paper-2)] p-4 text-xs text-[color:var(--muted)]">
        No daily history yet. Hit /api/snapshot daily to unlock true day‑over‑day momentum.
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Daily Deltas (real)
      </h3>
      <div className="mt-4 space-y-4">
        {withHistory.map((model) => (
          <div key={model.id} className="flex items-center gap-3">
            <div className="w-32 text-xs font-semibold text-[color:var(--ink)]">{model.id}</div>
            <div className="flex flex-1 items-end gap-1">
              {model.series.map((value, idx) => (
                <div
                  key={`${model.id}-${idx}`}
                  className="w-[6px] rounded-full bg-[color:var(--accent-2)]/70"
                  style={{ height: `${6 + value / Math.max(model.velocity * 6, 1)}px` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
