import Link from "next/link";
import Masthead from "@/components/Masthead";
import { getModelTagsByType } from "@/lib/hf";
import { groupPipelineTags } from "@/lib/categories";

export default async function CategoriesPage() {
  const tagsByType = await getModelTagsByType();
  const pipelineTags = tagsByType.pipeline_tag ?? [];
  const groups = groupPipelineTags(pipelineTags);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-10">
      <Masthead updatedAt={new Date().toISOString()} />

      <section className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <h2 className="text-2xl font-semibold text-[color:var(--ink)]">All Categories</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Explore the full frontier taxonomy from Hugging Face pipeline tags.
        </p>

        <div className="mt-6 space-y-8">
          {groups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/categories/${tag.id}`}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                >
                  {tag.label}
                </Link>
              ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
