"use client";

import type { MetricsSummary } from "@/lib/api";

interface Props {
  summary: MetricsSummary | null;
}

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-white truncate">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1.5">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-gray-800 rounded w-20 mb-3" />
      <div className="h-8 bg-gray-800 rounded w-24 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-16" />
    </div>
  );
}

export default function MetricsSummary({ summary }: Props) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const topEntry = Object.entries(summary.events_by_name).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Events"
        value={summary.total_events.toLocaleString()}
        sub="all time"
      />
      <Card
        label="Unique Users"
        value={summary.unique_users.toLocaleString()}
        sub="distinct user_ids"
      />
      <Card
        label="Unique Sessions"
        value={summary.unique_sessions.toLocaleString()}
        sub="distinct sessions"
      />
      <Card
        label="Top Event"
        value={topEntry?.[0] ?? "—"}
        sub={topEntry ? `${topEntry[1].toLocaleString()} occurrences` : undefined}
      />
    </div>
  );
}
