import Link from "next/link";
import Image from "next/image";
import type { HFPaper } from "@/lib/hf";

export default function PaperBridgeCard({
  paper,
  repos,
  citations,
}: {
  paper: HFPaper;
  repos: { type: string; repo: { id: string; type: string } }[];
  citations?: number | null;
}) {
  const paperDetail = paper.paper;
  const detail = paperDetail ?? paper;
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="flex gap-4">
        {paper.thumbnail ? (
          <Image
            src={paper.thumbnail}
            alt={detail.title}
            width={120}
            height={84}
            className="h-[84px] w-[120px] rounded-[12px] object-cover"
          />
        ) : (
          <div className="h-[84px] w-[120px] rounded-[12px] bg-[color:var(--paper-2)]" />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Link
            href={`/papers/${detail.id}`}
            className="text-base font-semibold text-[color:var(--ink)] hover:text-[color:var(--accent)]"
          >
            {detail.title}
          </Link>
          <p className="text-xs text-[color:var(--muted)] line-clamp-3">
            {paperDetail?.ai_summary ?? detail.summary}
          </p>
          {citations !== undefined && citations !== null && (
            <p className="text-[11px] text-[color:var(--muted)]">Citations {citations}</p>
          )}
        </div>
      </div>
      {repos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {repos.slice(0, 4).map((repo) => (
            <Link
              key={repo.repo.id}
              href={`/models/${repo.repo.id}`}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] text-[color:var(--muted)]"
            >
              {repo.repo.id}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
