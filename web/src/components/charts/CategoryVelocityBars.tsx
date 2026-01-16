export type CategoryVelocity = {
  label: string;
  velocity: number;
};

export default function CategoryVelocityBars({ rows }: { rows: CategoryVelocity[] }) {
  const max = Math.max(...rows.map((row) => row.velocity), 1);
  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Category Velocity
      </h3>
      <p className="mt-2 text-xs text-[color:var(--muted)]">Aggregated daily downloads per category.</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-28 text-xs font-semibold text-[color:var(--ink)]">{row.label}</div>
            <div className="relative h-2 flex-1 rounded-full bg-[color:var(--border)]">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-[color:var(--accent-2)]"
                style={{ width: `${Math.min(100, (row.velocity / max) * 100)}%` }}
              />
            </div>
            <div className="w-14 text-right text-xs text-[color:var(--muted)]">
              {Math.round(row.velocity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
