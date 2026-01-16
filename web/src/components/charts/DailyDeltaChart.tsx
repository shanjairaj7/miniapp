"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoredModel } from "@/lib/score";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DailyDeltaChart({ models }: { models: ScoredModel[] }) {
  const withHistory = models.filter((model) => model.series.length > 0).slice(0, 3);

  if (withHistory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Daily Deltas</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-[color:var(--muted)]">
          No daily history yet. Trigger /api/snapshot daily to unlock real deltas.
        </CardContent>
      </Card>
    );
  }

  const length = Math.max(...withHistory.map((model) => model.series.length));
  const data = Array.from({ length }, (_, index) => {
    const point: Record<string, number | string> = { day: `D-${length - index}` };
    withHistory.forEach((model) => {
      point[model.id] = model.series[index] ?? 0;
    });
    return point;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Daily Deltas</CardTitle>
        <p className="text-xs text-[color:var(--muted)]">True day‑over‑day download changes.</p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            {withHistory.map((model, idx) => (
              <Line
                key={model.id}
                type="monotone"
                dataKey={model.id}
                stroke={idx === 0 ? "var(--chart-1)" : idx === 1 ? "var(--chart-2)" : "var(--chart-4)"}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
