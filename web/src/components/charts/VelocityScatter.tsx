import type { ScoredModel } from "@/lib/score";

export default function VelocityScatter({ models }: { models: ScoredModel[] }) {
  const width = 320;
  const height = 220;
  const padding = 28;
  const maxVelocity = Math.max(...models.map((m) => m.velocity), 1);
  const maxRecency = Math.max(...models.map((m) => m.recencyDays), 1);

  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Velocity vs Recency
      </h3>
      <p className="mt-2 text-xs text-[color:var(--muted)]">
        Newer models on the left, faster downloads on the top.
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-52 w-full">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cfc7ba"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cfc7ba"
          strokeWidth={1}
        />
        {models.slice(0, 40).map((model) => {
          const x = padding + (1 - model.recencyDays / maxRecency) * (width - padding * 2);
          const y = height - padding - (model.velocity / maxVelocity) * (height - padding * 2);
          return (
            <circle
              key={model.id}
              cx={x}
              cy={y}
              r={4}
              fill={model.trendLabel === "Breakout" ? "#ff7a1a" : "#0e8a7a"}
              opacity={0.85}
            />
          );
        })}
      </svg>
    </div>
  );
}
