import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import { getModelInfo, getPaper } from "@/lib/hf";
import { scoreModels } from "@/lib/score";
import { formatDate, formatNumber } from "@/lib/utils";
import { getHistoryStats, getSeriesFromHistory, loadHistory } from "@/lib/history";
import { getOpenAlexWorkByArxivId } from "@/lib/openalex";
import {
  extractDatasets,
  extractLanguages,
  extractLicense,
  extractArxivId,
  getPaperThumbnail,
  getProviderCount,
} from "@/lib/signals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ModelBenchmarks, { type ModelIndexEntry } from "@/components/ModelBenchmarks";

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const resolved = await params;
  const segments = resolved?.id;
  if (!segments || segments.length === 0) {
    notFound();
  }
  const modelId = segments.join("/");

  const [base, history, providerInfo, cardInfo] = await Promise.all([
    getModelInfo(modelId),
    loadHistory(),
    getModelInfo(modelId, "inferenceProviderMapping").catch(() => null),
    getModelInfo(modelId, "cardData").catch(() => null),
  ]);
  const historyStats = getHistoryStats(history);
  const updatedAt = historyStats.lastDate ?? new Date().toISOString();

  const model = {
    ...base,
    inferenceProviderMapping: providerInfo?.inferenceProviderMapping ?? base.inferenceProviderMapping,
    cardData: cardInfo?.cardData ?? base.cardData,
  };

  const historySeries = getSeriesFromHistory(model.id, history);
  const [scored] = scoreModels([model], historySeries ? { [model.id]: historySeries } : undefined);

  const cardData = model.cardData as { license?: string; language?: string[]; datasets?: string[] } | undefined;
  const license = extractLicense(model.tags ?? []).license ?? cardData?.license;
  const arxivId = extractArxivId(model.tags ?? []);
  const paperThumb = getPaperThumbnail(arxivId);
  const languages = cardData?.language ?? extractLanguages(model.tags ?? []);
  const datasets = cardData?.datasets ?? extractDatasets(model.tags ?? []);
  const hasHistory = scored.series.length > 0;
  const providerCount = getProviderCount(model);

  const [paper, openalex] = await Promise.all([
    arxivId ? getPaper(arxivId).catch(() => null) : Promise.resolve(null),
    arxivId ? getOpenAlexWorkByArxivId(arxivId).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={updatedAt} />

      <section className="grid gap-6 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8 md:grid-cols-[160px_1fr]">
        <div className="flex items-start justify-center">
          {paperThumb ? (
            <Image
              src={paperThumb}
              alt={model.id}
              width={160}
              height={112}
              className="h-[112px] w-[160px] rounded-[12px] object-cover"
            />
          ) : (
            <div className="flex h-[112px] w-[160px] items-center justify-center rounded-[12px] border border-dashed border-[color:var(--border)] text-xs text-[color:var(--muted)]">
              No preview
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Model</p>
              <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{model.id}</h2>
              <p className="text-sm text-[color:var(--muted)]">
                {model.pipeline_tag ?? "general"} · {model.library_name ?? "unknown"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" asChild>
                <Link href={`https://huggingface.co/${model.id}`}>Open on HF</Link>
              </Button>
              {arxivId && (
                <Button variant="outline" asChild>
                  <Link href={`/papers/${arxivId}`}>Linked paper</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">30d downloads</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {formatNumber(model.downloads)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Likes</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {formatNumber(model.likes)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Avg / day</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {formatNumber(scored.velocity, 1)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Lift</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {formatNumber(scored.lift, 1)}x
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">License</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">{license ?? "unknown"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {providerCount > 0 && <Badge variant="secondary">Providers {providerCount}</Badge>}
            {(model.safetensors?.total ?? 0) > 0 && <Badge variant="secondary">Safetensors</Badge>}
            {(model.gguf?.total ?? 0) > 0 && <Badge variant="secondary">GGUF</Badge>}
            {model.gated && <Badge variant="outline">Gated</Badge>}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Languages</p>
              <p className="mt-2 text-sm text-[color:var(--ink)]">
                {languages?.length ? languages.join(", ") : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Datasets</p>
              <p className="mt-2 text-sm text-[color:var(--ink)]">
                {datasets?.length ? datasets.slice(0, 4).join(", ") : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Updated</p>
              <p className="mt-2 text-sm text-[color:var(--ink)]">{formatDate(model.lastModified)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Daily Momentum</p>
            {hasHistory ? (
              <div className="mt-3 flex items-end gap-1">
                {scored.series.map((value, idx) => (
                  <div
                    key={`bar-${idx}`}
                    className="w-3 rounded-full bg-[color:var(--accent-2)]/70"
                    style={{ height: `${8 + value / Math.max(scored.velocity * 5, 1)}px` }}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                No daily history yet. Start snapshots to unlock true day‑over‑day deltas.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <h3 className="text-lg font-semibold text-[color:var(--ink)]">Artifacts</h3>
        <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
          <div>Last modified: {formatDate(model.lastModified)}</div>
          <div>Created: {formatDate(model.createdAt)}</div>
          {model.safetensors?.total && <div>Safetensors files: {model.safetensors.total}</div>}
          {providerCount > 0 && (
            <div>
              Providers: {Object.keys(model.inferenceProviderMapping ?? {}).slice(0, 6).join(", ")}
            </div>
          )}
        </div>
        {model.siblings && model.siblings.length > 0 && (
          <div className="mt-6 grid gap-2">
            {model.siblings.slice(0, 12).map((file) => (
              <div
                key={file.rfilename}
                className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-2 text-xs text-[color:var(--muted)]"
              >
                {file.rfilename}
              </div>
            ))}
          </div>
        )}
      </section>

      {paper && (
        <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Linked Paper</p>
            <h3 className="text-2xl font-semibold text-[color:var(--ink)]">{paper.paper?.title ?? paper.title}</h3>
            <p className="text-sm text-[color:var(--muted)]">
              {paper.paper?.authors?.map((author) => author.name).join(", ")}
            </p>
            <p className="text-sm text-[color:var(--muted)]">
              {paper.paper?.ai_summary ?? paper.paper?.summary ?? paper.summary}
            </p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {paper.paper?.upvotes !== undefined && (
                <span>Upvotes {formatNumber(paper.paper?.upvotes)}</span>
              )}
              {openalex?.cited_by_count !== undefined && (
                <span>Citations {formatNumber(openalex.cited_by_count)}</span>
              )}
              {openalex?.publication_date && <span>Published {formatDate(openalex.publication_date)}</span>}
            </div>
          </div>
        </section>
      )}

      {model["model-index"] && Array.isArray(model["model-index"]) && (
        <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Benchmarks</h3>
          <div className="mt-6">
            <ModelBenchmarks entries={model["model-index"] as ModelIndexEntry[]} />
          </div>
        </section>
      )}
    </div>
  );
}
