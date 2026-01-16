import type { ScoredModel } from "@/lib/score";
import { formatNumber } from "@/lib/utils";

export default function CoolingLadder({ models }: { models: ScoredModel[] }) {
  const cooling = [...models]
    .sort((a, b) => a.decayScore - b.decayScore)
    .slice(0, 6);

  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white/80 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Cooling Ladder
      </h3>
      <div className="mt-4 space-y-3">
        {cooling.map((model) => (
          <div key={model.id} className="flex items-center gap-3">
            <div className="w-32 text-xs font-semibold text-[color:var(--ink)]">{model.id}</div>
            <div className="relative h-2 flex-1 rounded-full bg-[color:var(--border)]">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-[color:var(--ink)]"
                style={{ width: `${Math.min(100, Math.abs(model.decayScore) * 100)}%` }}
              />
            </div>
            <div className="w-14 text-right text-xs text-[color:var(--muted)]">
              {formatNumber(model.decayScore * 100, 0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
