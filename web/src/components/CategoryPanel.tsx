import Link from "next/link";
import type { CategoryGroup } from "@/lib/categories";

export default function CategoryPanel({ groups }: { groups: CategoryGroup[] }) {
  return (
    <aside className="flex flex-col gap-6 rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Categories</p>
        <h2 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">Stack Directory</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Full taxonomy of pipeline tags, grouped by modality.
        </p>
      </div>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {group.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/categories/${tag.id}`}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                >
                  {tag.label}
                </Link>
              ))}
              {group.tags.length > 8 && (
                <Link
                  href={`/categories?group=${group.id}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]"
                >
                  View all
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
