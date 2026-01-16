"use client";

import { formatNumber } from "@/lib/utils";

type ScoredModel = {
  velocity: number;
  lift: number;
  momentumRatio: number;
  acceleration: number;
};

export default function TrendsHero({ models }: { models: ScoredModel[] }) {
  const avgVelocity = models.length ? models.reduce((sum, m) => sum + m.velocity, 0) / models.length : 0;
  const avgLift = models.length ? models.reduce((sum, m) => sum + m.lift, 0) / models.length : 0;
  const accelerating = models.filter((m) => m.acceleration > 0).length;
  const maxMomentum = models.length ? Math.max(...models.map((m) => m.momentumRatio)) : 0;

  return (
    <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Avg Daily Velocity */}
      <div className="rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
              Avg Velocity
            </p>
            <p className="mt-3 text-4xl font-black text-blue-600">{formatNumber(avgVelocity, 1)}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">downloads per day</p>
          </div>
          <div className="text-5xl">📈</div>
        </div>
      </div>

      {/* Avg Lift */}
      <div className="rounded-[16px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Avg Lift</p>
            <p className="mt-3 text-4xl font-black text-emerald-600">{formatNumber(avgLift, 2)}x</p>
            <p className="mt-2 text-sm text-emerald-700/70">vs baseline</p>
          </div>
          <div className="text-5xl">⚡</div>
        </div>
      </div>

      {/* Accelerating */}
      <div className="rounded-[16px] border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-700">Accelerating</p>
            <p className="mt-3 text-4xl font-black text-purple-600">{accelerating}</p>
            <p className="mt-2 text-sm text-purple-700/70">
              {accelerating > 0 ? `${formatNumber((accelerating / models.length) * 100, 0)}% of models` : "No models yet"}
            </p>
          </div>
          <div className="text-5xl">🚀</div>
        </div>
      </div>

      {/* Peak Momentum */}
      <div className="rounded-[16px] border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-700">Peak Momentum</p>
            <p className="mt-3 text-4xl font-black text-orange-600">{formatNumber(maxMomentum * 100, 0)}%</p>
            <p className="mt-2 text-sm text-orange-700/70">highest in cohort</p>
          </div>
          <div className="text-5xl">🔥</div>
        </div>
      </div>
    </div>
  );
}
