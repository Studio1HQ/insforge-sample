"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Event, HourlyBucket } from "@/lib/api";

interface Props {
  events: Event[];
  hourly: HourlyBucket[];
}

function formatHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    hour12: true,
  });
}

/** Aggregate raw events into hourly buckets client-side. */
function eventsToHourly(events: Event[]) {
  const map = new Map<string, number>();
  for (const e of events) {
    const d = new Date(e.created_at);
    d.setMinutes(0, 0, 0);
    const key = d.toISOString();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ label: formatHour(time), count }));
}

/** Merge pre-computed hourly rows by summing across event types per bucket. */
function bucketToHourly(buckets: HourlyBucket[]) {
  const map = new Map<string, number>();
  for (const b of buckets) {
    map.set(b.bucket_start, (map.get(b.bucket_start) ?? 0) + b.count);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ label: formatHour(time), count }));
}

export default function EventVolumeChart({ events, hourly }: Props) {
  const usingHourly = hourly.length > 0;
  const data = usingHourly ? bucketToHourly(hourly) : eventsToHourly(events);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-300">Event Volume</h2>
        <span className="text-xs text-gray-600">
          {usingHourly ? "pre-computed hourly" : "derived from events"}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-52 text-gray-600 text-sm">
          No event data yet — click Simulate Events
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#374151", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#volGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
