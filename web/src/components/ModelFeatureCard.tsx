import Link from "next/link";
import Image from "next/image";
import type { ScoredModel } from "@/lib/score";
import { formatNumber, formatRelativeDays } from "@/lib/utils";
import { extractArxivId, getPaperThumbnail } from "@/lib/signals";
import CategoryIcon, { getCategoryTone } from "./CategoryIcon";

export default function ModelFeatureCard({ model }: { model: ScoredModel }) {
  const tone = getCategoryTone(model.pipeline_tag);
  const arxivId = extractArxivId(model.tags ?? []);
  const thumb = getPaperThumbnail(arxivId);
  return (
    <Link
      href={`/models/${model.id}`}
      className="group flex gap-4 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4 transition hover:border-[color:var(--accent)]"
    >
      {thumb ? (
        <Image
          src={thumb}
          alt={model.id}
          width={84}
          height={84}
          className="h-[84px] w-[84px] rounded-[12px] object-cover"
        />
      ) : (
        <CategoryIcon pipeline={model.pipeline_tag} />
      )}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
              {model.id}
            </h3>
            <p className="text-xs text-[color:var(--muted)]">
              {tone.label} · {model.library_name ?? "unknown"}
            </p>
          </div>
          <div
            className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: tone.color, backgroundColor: tone.bg }}
          >
            {model.trendLabel}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[color:var(--muted)]">
          <span>Lift {formatNumber(model.lift, 1)}x</span>
          <span>Momentum {formatNumber(model.momentumRatio * 100, 0)}%</span>
          <span>30d {formatNumber(model.downloads)}</span>
          <span>{formatRelativeDays(model.lastModified)}</span>
        </div>
      </div>
    </Link>
  );
}
