import Link from "next/link";
import type { HFPaper } from "@/lib/hf";
import { formatDate, formatNumber } from "@/lib/utils";

export default function PaperCard({ paper }: { paper: HFPaper }) {
  const paperDetail = paper.paper;
  const detail = paperDetail ?? paper;
  return (
    <Link
      href={`/papers/${detail.id}`}
      className="group flex flex-col gap-3 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition hover:border-[color:var(--accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
          {detail.title}
        </h3>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Paper
        </span>
      </div>
      <p className="text-sm text-[color:var(--muted)] line-clamp-3">{paperDetail?.ai_summary ?? detail.summary}</p>
      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <span>{formatDate(detail.publishedAt)}</span>
        {paperDetail?.upvotes !== undefined && <span>upvotes {formatNumber(paperDetail.upvotes)}</span>}
        {paperDetail?.githubStars !== undefined && <span>github {formatNumber(paperDetail.githubStars)}</span>}
      </div>
    </Link>
  );
}
