import Masthead from "@/components/Masthead";
import PaperCard from "@/components/PaperCard";
import { getDailyPapers } from "@/lib/hf";

export default async function PapersPage() {
  const papers = await getDailyPapers();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={new Date().toISOString()} />

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <h2 className="text-2xl font-semibold text-[color:var(--ink)]">Daily Papers</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Hand-curated research drops with summaries, keywords, and project links.
        </p>
        <div className="mt-6 grid gap-5">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </section>
    </div>
  );
}
