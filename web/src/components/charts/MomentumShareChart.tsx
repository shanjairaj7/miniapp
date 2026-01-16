"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { ScoredModel } from "@/lib/score";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MomentumShareChart({ models }: { models: ScoredModel[] }) {
  const data = [...models]
    .filter((model) => (model.downloadsAllTime ?? 0) > 0)
    .sort((a, b) => b.momentumRatio - a.momentumRatio)
    .slice(0, 8)
    .map((model) => ({
      name: model.id,
      ratio: Math.round(model.momentumRatio * 100),
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Momentum Share</CardTitle>
        <p className="text-xs text-[color:var(--muted)]">
          30‑day downloads as a share of all‑time downloads.
        </p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10 }}
              width={140}
              tickFormatter={(value) => value.split("/").pop()}
            />
            <Tooltip formatter={(value) => (typeof value === 'number' ? `${formatNumber(value, 0)}%` : value)} />
            <Bar dataKey="ratio" fill="var(--chart-2)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
