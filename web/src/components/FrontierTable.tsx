import Link from "next/link";
import type { ScoredModel } from "@/lib/score";
import { formatNumber, formatRelativeDays } from "@/lib/utils";

export default function FrontierTable({ models }: { models: ScoredModel[] }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)]">
      <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-[color:var(--paper-2)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>Model</span>
        <span>Category</span>
        <span>Momentum</span>
        <span>30d DL</span>
        <span>Likes</span>
        <span>Updated</span>
      </div>
      <div className="divide-y divide-[color:var(--border)]">
        {models.map((model) => (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
          >
            <span className="font-semibold">{model.id}</span>
            <span className="text-xs text-[color:var(--muted)]">
              {model.pipeline_tag ?? "general"}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-[color:var(--border)]">
                <div
                  className="h-2 rounded-full bg-[color:var(--accent)]"
                  style={{ width: `${Math.min(100, model.momentumRatio * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[color:var(--muted)]">
                {formatNumber(model.momentumRatio * 100, 0)}%
              </span>
            </div>
            <span>{formatNumber(model.downloads)}</span>
            <span>{formatNumber(model.likes)}</span>
            <span className="text-xs text-[color:var(--muted)]">
              {formatRelativeDays(model.lastModified)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
