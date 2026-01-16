"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { ScoredModel } from "@/lib/score";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function LiftLadderChart({ models }: { models: ScoredModel[] }) {
  const data = [...models]
    .filter((model) => model.lift > 0)
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 8)
    .map((model) => ({
      name: model.id,
      lift: Number(model.lift.toFixed(2)),
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Lift Ladder</CardTitle>
        <p className="text-xs text-[color:var(--muted)]">
          Current velocity vs lifetime baseline. Higher means breakout.
        </p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10 }}
              width={140}
              tickFormatter={(value) => value.split("/").pop()}
            />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? `${formatNumber(value, 2)}x` : value)}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="lift" fill="var(--chart-1)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
