import type { ScoredModel } from "@/lib/score";
import { formatNumber } from "@/lib/utils";

export default function MomentumRibbons({ models }: { models: ScoredModel[] }) {
  const top = models.slice(0, 6);
  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Momentum Ribbons
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">avg daily</span>
      </div>
      <div className="mt-4 space-y-4">
        {top.map((model) => (
          <div key={model.id} className="flex items-center gap-3">
            <div className="w-32 text-xs font-semibold text-[color:var(--ink)]">{model.id}</div>
            <div className="flex flex-1 items-end gap-1">
              {model.series.map((value, idx) => (
                <div
                  key={`${model.id}-${idx}`}
                  style={{ height: `${6 + value / Math.max(model.velocity * 6, 1)}px` }}
                  className="w-[6px] rounded-full bg-[color:var(--accent-2)]/70"
                />
              ))}
            </div>
            <div className="w-16 text-right text-xs text-[color:var(--muted)]">
              {formatNumber(model.velocity, 1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
