import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber, slugify } from "@/lib/utils";

export type ModelIndexEntry = {
  name?: string;
  results?: Array<{
    task?: { name?: string; type?: string };
    dataset?: { name?: string; type?: string; config?: string; split?: string };
    metrics?: Array<{ name?: string; type?: string; value?: number; verified?: boolean }>;
  }>;
};

type TaskGroup = {
  id: string;
  label: string;
  rows: Array<{
    dataset: string;
    split?: string;
    metric: string;
    value?: number;
    verified?: boolean;
  }>;
};

function buildTaskGroups(entries: ModelIndexEntry[]) {
  const groups = new Map<string, TaskGroup>();

  entries.forEach((entry) => {
    entry.results?.forEach((result) => {
      const taskLabel = result.task?.name ?? result.task?.type ?? "Unknown task";
      const id = slugify(taskLabel);
      const datasetParts = [result.dataset?.name, result.dataset?.config, result.dataset?.type]
        .filter(Boolean)
        .join(" · ");
      const dataset = datasetParts || "Unknown dataset";
      result.metrics?.forEach((metric) => {
        const metricLabel = metric.name ?? metric.type ?? "Metric";
        const group = groups.get(id) ?? { id, label: taskLabel, rows: [] };
        group.rows.push({
          dataset,
          split: result.dataset?.split,
          metric: metricLabel,
          value: metric.value,
          verified: metric.verified,
        });
        groups.set(id, group);
      });
    });
  });

  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export default function ModelBenchmarks({ entries }: { entries: ModelIndexEntry[] }) {
  if (!entries.length) {
    return <p className="text-sm text-[color:var(--muted)]">No benchmark data available.</p>;
  }

  const groups = buildTaskGroups(entries);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-[color:var(--ink)]">{group.label}</h4>
              <Badge variant="secondary">{group.rows.length} results</Badge>
            </div>
            <div className="mt-4 overflow-hidden rounded-[12px] border border-[color:var(--border)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.rows.map((row, index) => (
                    <TableRow key={`${group.id}-${index}`}>
                      <TableCell className="font-medium">{row.dataset}</TableCell>
                      <TableCell>{row.split ?? "—"}</TableCell>
                      <TableCell>{row.metric}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.value, 3)}</TableCell>
                      <TableCell>{row.verified ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </div>

      <aside className="h-fit rounded-[12px] border border-[color:var(--border)] bg-[color:var(--paper-2)] p-4 lg:sticky lg:top-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">On this page</p>
        <Separator className="my-3" />
        <div className="flex flex-col gap-2 text-sm">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="text-[color:var(--muted)] hover:text-[color:var(--accent)]"
            >
              {group.label}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
