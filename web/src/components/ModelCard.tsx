import Link from "next/link";
import type { ScoredModel } from "@/lib/score";
import { formatNumber, formatRelativeDays } from "@/lib/utils";
import TrendBadge from "./TrendBadge";

export default function ModelCard({ model }: { model: ScoredModel }) {
  return (
    <Link
      href={`/models/${model.id}`}
      className="group flex flex-col gap-4 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition hover:border-[color:var(--accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
            {model.id}
          </h3>
          <p className="text-sm text-[color:var(--muted)]">
            {model.pipeline_tag ?? "general"} · {model.library_name ?? "unknown"}
          </p>
        </div>
        <TrendBadge label={model.trendLabel} />
      </div>

      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <span>30d downloads {formatNumber(model.downloads)}</span>
        <span>likes {formatNumber(model.likes)}</span>
        <span>avg / day {formatNumber(model.velocity, 1)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(model.tags ?? []).slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] text-[color:var(--muted)]"
          >
            {tag.replace(/^(license:|dataset:)/, "")}
          </span>
        ))}
      </div>

      <p className="text-xs text-[color:var(--muted)]">Last updated {formatRelativeDays(model.lastModified)}</p>
    </Link>
  );
}
