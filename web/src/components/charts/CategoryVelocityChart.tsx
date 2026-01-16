"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type CategoryVelocityDatum = { label: string; velocity: number };

export default function CategoryVelocityChart({ rows }: { rows: CategoryVelocityDatum[] }) {
  const data = rows.map((row) => ({
    name: row.label,
    velocity: Number(row.velocity.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Category Velocity</CardTitle>
        <p className="text-xs text-[color:var(--muted)]">Aggregate daily download velocity per category.</p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
            <Tooltip formatter={(value) => (typeof value === 'number' ? formatNumber(value, 1) : value)} />
            <Bar dataKey="velocity" fill="var(--chart-3)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
