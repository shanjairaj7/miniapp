import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BenchmarkEntry } from "@/lib/benchmarks";
import { formatNumber } from "@/lib/utils";

export default function BenchmarkTable({ entries }: { entries: BenchmarkEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-[color:var(--muted)]">No benchmark data available yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[color:var(--border)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Dataset</TableHead>
            <TableHead>Metric</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={`${entry.modelId}-${index}`}>
              <TableCell className="font-medium">
                <Link href={`/models/${entry.modelId}`} className="hover:text-[color:var(--accent)]">
                  {entry.modelId}
                </Link>
              </TableCell>
              <TableCell>{entry.task ?? "—"}</TableCell>
              <TableCell>{entry.dataset ?? "—"}</TableCell>
              <TableCell>{entry.metric ?? "—"}</TableCell>
              <TableCell className="text-right">{formatNumber(entry.value, 3)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
