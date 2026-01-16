"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

type ScoredModel = {
  id: string;
  velocity: number;
  lift: number;
  momentumRatio: number;
  trendLabel: string;
  frontierScore: number;
};

type SortBy = "frontier" | "velocity" | "momentum";
type TimeRange = "all" | "week" | "day";

export default function Leaderboard({ models }: { models: ScoredModel[] }) {
  const [sortBy, setSortBy] = useState<SortBy>("frontier");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Simulate sorting with loading
  const handleChange = (type: "sort" | "time", value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (type === "sort") setSortBy(value as SortBy);
      else setTimeRange(value as TimeRange);
      setIsLoading(false);
    }, 300);
  };

  let sortedModels = [...models];
  if (sortBy === "velocity") {
    sortedModels.sort((a, b) => b.velocity - a.velocity);
  } else if (sortBy === "momentum") {
    sortedModels.sort((a, b) => b.momentumRatio - a.momentumRatio);
  } else {
    sortedModels.sort((a, b) => b.frontierScore - a.frontierScore);
  }

  const topModels = sortedModels.slice(0, 10);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRowColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-100 hover:bg-yellow-100/50";
    if (rank === 2) return "bg-slate-50 border-slate-100 hover:bg-slate-100/50";
    if (rank === 3) return "bg-orange-50 border-orange-100 hover:bg-orange-100/50";
    return "hover:bg-[color:var(--paper-2)]";
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--ink)]">Leaderboard</h2>
          <p className="mt-1 text-[color:var(--muted)]">
            {sortBy === "frontier" && "Ranked by frontier score"}
            {sortBy === "velocity" && "Ranked by downloads/day"}
            {sortBy === "momentum" && "Ranked by momentum"}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)]"
          >
            <option value="frontier">Frontier Score</option>
            <option value="velocity">Downloads/Day</option>
            <option value="momentum">Momentum</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => handleChange("time", e.target.value)}
            className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)]"
          >
            <option value="all">All time</option>
            <option value="week">This week</option>
            <option value="day">Today</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3 rounded-[16px] border border-[color:var(--border)] bg-white p-4 shadow-sm">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[color:var(--paper-2)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded-md bg-[color:var(--paper-2)]" />
                <div className="h-3 w-1/4 animate-pulse rounded-md bg-[color:var(--border)]" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded-md bg-[color:var(--paper-2)]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="overflow-x-auto rounded-[16px] border border-[color:var(--border)] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                  Model
                </th>
                <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] sm:table-cell">
                  Velocity
                </th>
                <th className="hidden px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] lg:table-cell">
                  Lift
                </th>
                <th className="hidden px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)] lg:table-cell">
                  Momentum
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {topModels.map((model, idx) => {
                const medal = getMedalIcon(idx + 1);
                const rowColor = getRowColor(idx + 1);

                return (
                  <tr key={model.id} className={`border-b border-[color:var(--border)] transition ${rowColor}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {medal && <span className="text-xl">{medal}</span>}
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold ${
                            idx === 0
                              ? "bg-yellow-200 text-yellow-900"
                              : idx === 1
                                ? "bg-gray-300 text-gray-900"
                                : idx === 2
                                  ? "bg-orange-200 text-orange-900"
                                  : "bg-[color:var(--paper-2)] text-[color:var(--ink)]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[color:var(--ink)]">{model.id}</p>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">{model.trendLabel}</p>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <p className="font-semibold text-[color:var(--ink)]">{formatNumber(model.velocity, 1)}</p>
                      <p className="text-xs text-[color:var(--muted)]">/day</p>
                    </td>
                    <td className="hidden px-6 py-4 text-right lg:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                          {formatNumber(model.lift, 1)}x
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-right lg:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-lg">🔥</span>
                        <p className="font-medium text-[color:var(--ink)]">
                          {formatNumber(model.momentumRatio * 100, 0)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/models/${model.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href="/trends">View All {models.length} Models →</Link>
      </Button>
    </div>
  );
}
