export type HeatmapRow = { label: string; values: number[] };

export default function StackHeatmap({ rows }: { rows: HeatmapRow[] }) {
  const maxValue = Math.max(
    ...rows.flatMap((row) => row.values),
    1
  );

  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-white/80 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Stack Heatmap
      </h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-28 text-xs font-semibold text-[color:var(--ink)]">{row.label}</div>
            <div className="flex flex-1 gap-1">
              {row.values.map((value, idx) => (
                <div
                  key={`${row.label}-${idx}`}
                  className="h-4 flex-1 rounded"
                  style={{
                    backgroundColor: `rgba(255,122,26,${0.15 + (value / maxValue) * 0.75})`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
