import type { ScoredModel } from "@/lib/score";

export default function BreakoutQuadrant({ models }: { models: ScoredModel[] }) {
  const width = 320;
  const height = 220;
  const padding = 24;
  const maxVelocity = Math.max(...models.map((m) => m.velocity), 1);

  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white/80 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Breakout Quadrant
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-52 w-full">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
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
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#e5ddd3"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <line
          x1={width / 2}
          y1={padding}
          x2={width / 2}
          y2={height - padding}
          stroke="#e5ddd3"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {models.slice(0, 40).map((model) => {
          const x = padding + (model.velocity / maxVelocity) * (width - padding * 2);
          const y = height / 2 - model.acceleration * (height / 2 - padding);
          return (
            <circle
              key={model.id}
              cx={x}
              cy={y}
              r={4}
              fill={model.trendLabel === "Breakout" ? "#ff7a1a" : "#0e8a7a"}
              opacity={0.8}
            />
          );
        })}
      </svg>
      <p className="text-xs text-[color:var(--muted)]">
        Velocity (x) vs acceleration (y). Top-right = fastest breakouts.
      </p>
    </div>
  );
}
