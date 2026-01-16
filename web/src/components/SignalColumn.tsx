import Link from "next/link";
import type { ScoredModel } from "@/lib/score";
import { formatNumber } from "@/lib/utils";

export default function SignalColumn({
  title,
  description,
  models,
  metric,
}: {
  title: string;
  description: string;
  models: ScoredModel[];
  metric: (model: ScoredModel) => string;
}) {
  return (
    <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
      <h3 className="text-sm font-semibold text-[color:var(--ink)]">{title}</h3>
      <p className="mt-1 text-xs text-[color:var(--muted)]">{description}</p>
      <div className="mt-4 space-y-3">
        {models.length === 0 ? (
          <p className="text-xs text-[color:var(--muted)]">Not enough data yet.</p>
        ) : (
          models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-transparent px-2 py-2 text-sm transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)]"
            >
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">{model.id}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {model.pipeline_tag ?? "general"} · {formatNumber(model.velocity, 1)}/day
                </p>
              </div>
              <span className="text-xs font-semibold text-[color:var(--accent)]">{metric(model)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
