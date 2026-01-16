import Link from "next/link";
import Masthead from "@/components/Masthead";
import { getPaper, getPaperRepos } from "@/lib/hf";
import { getOpenAlexWorkByArxivId } from "@/lib/openalex";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const paperId = resolved.id;
  const [paper, repos, openalex] = await Promise.all([
    getPaper(paperId),
    getPaperRepos(paperId),
    getOpenAlexWorkByArxivId(paperId),
  ]);

  const paperDetail = paper.paper;
  const detail = paperDetail ?? paper;
  const pdfUrl = `https://arxiv.org/pdf/${paperId}.pdf#toolbar=1&view=FitH`;
  const authors = paperDetail?.authors || [];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 pb-12 pt-6">
      <Masthead updatedAt={new Date().toISOString()} compact />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)]">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            <span>Paper Viewer</span>
            <Link
              href={pdfUrl}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]"
            >
              Open PDF
            </Link>
          </div>
          <iframe
            src={pdfUrl}
            title={detail.title}
            className="h-[calc(100vh-220px)] w-full"
          />
        </div>

        <aside className="flex flex-col gap-4 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Paper</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">{detail.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {authors?.map((author) => author.name).join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {paperDetail?.upvotes !== undefined && <Badge variant="secondary">Upvotes {paperDetail.upvotes}</Badge>}
            {paperDetail?.githubStars !== undefined && (
              <Badge variant="secondary">GitHub {formatNumber(paperDetail.githubStars)}</Badge>
            )}
            {openalex?.cited_by_count !== undefined && (
              <Badge variant="secondary">Citations {formatNumber(openalex.cited_by_count)}</Badge>
            )}
          </div>

          <Separator />

          <div className="text-sm text-[color:var(--muted)]">
            <p className="font-semibold text-[color:var(--ink)]">Summary</p>
            <p className="mt-2">{paperDetail?.ai_summary ?? detail.summary}</p>
          </div>

          <Separator />

          <div className="grid gap-2 text-sm text-[color:var(--muted)]">
            <div>Published: {formatDate(detail.publishedAt)}</div>
            <div>Venue: {openalex?.primary_location?.source?.display_name ?? "unknown"}</div>
            <div>Open access: {openalex?.open_access?.oa_status ?? "unknown"}</div>
          </div>

          {repos.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Linked HF Repos
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {repos.slice(0, 6).map((repo) => (
                    <Link
                      key={repo.repo.id}
                      href={`/models/${repo.repo.id}`}
                      className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-2 text-xs text-[color:var(--muted)]"
                    >
                      {repo.repo.id}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
