import type { ScoredModel } from "@/lib/score";
import { formatNumber } from "@/lib/utils";

export default function MomentumIndex({ models }: { models: ScoredModel[] }) {
  const top = models
    .filter((model) => (model.downloadsAllTime ?? 0) > 0)
    .sort((a, b) => b.momentumRatio - a.momentumRatio)
    .slice(0, 8);

  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Momentum Index
      </h3>
      <p className="mt-2 text-xs text-[color:var(--muted)]">
        30‑day downloads as a share of all‑time downloads.
      </p>
      <div className="mt-4 space-y-3">
        {top.map((model) => (
          <div key={model.id} className="flex items-center gap-3">
            <div className="w-32 text-xs font-semibold text-[color:var(--ink)]">{model.id}</div>
            <div className="relative h-2 flex-1 rounded-full bg-[color:var(--border)]">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-[color:var(--accent)]"
                style={{ width: `${Math.min(100, model.momentumRatio * 100)}%` }}
              />
            </div>
            <div className="w-14 text-right text-xs text-[color:var(--muted)]">
              {formatNumber(model.momentumRatio * 100, 0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
