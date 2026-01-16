export default function TrendBadge({ label }: { label: "Breakout" | "Cooling" | "New" | "Steady" }) {
  const colors: Record<typeof label, string> = {
    Breakout: "bg-[color:var(--paper-2)] text-[color:var(--accent)] border border-[color:var(--accent)]",
    Cooling: "bg-[color:var(--paper-2)] text-[color:var(--muted)] border border-[color:var(--border)]",
    New: "bg-[color:var(--paper-2)] text-[color:var(--accent-2)] border border-[color:var(--accent-2)]",
    Steady: "bg-[color:var(--paper-2)] text-[color:var(--muted)] border border-[color:var(--border)]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${colors[label]}`}
    >
      {label}
    </span>
  );
}
