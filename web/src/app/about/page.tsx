import Masthead from "@/components/Masthead";

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={new Date().toISOString()} />

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <h2 className="text-2xl font-semibold text-[color:var(--ink)]">Methodology</h2>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Frontier Pulse combines Hugging Face model signals with paper intelligence to highlight what is new,
          accelerating, and buildable.
        </p>
        <div className="mt-6 space-y-4 text-sm text-[color:var(--muted)]">
          <p>
            <span className="font-semibold text-[color:var(--ink)]">Data sources:</span> Hugging Face Hub models,
            daily papers, and OpenAlex enrichment for citations and venue metadata.
          </p>
          <p>
            <span className="font-semibold text-[color:var(--ink)]">Frontier score:</span> weighted blend of 30‑day
            download velocity, trend acceleration, recency, and community interest.
          </p>
          <p>
            <span className="font-semibold text-[color:var(--ink)]">Charts:</span> momentum ribbons visualize daily
            growth (estimated from 30‑day downloads unless historical snapshots are available).
          </p>
          <p>
            <span className="font-semibold text-[color:var(--ink)]">Refresh cadence:</span> cached for 30–60 minutes
            with optional daily snapshot collection for true day‑over‑day deltas.
          </p>
        </div>
      </section>
    </div>
  );
}
