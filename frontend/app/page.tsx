"use client";

import { useState, useEffect, useCallback } from "react";
import MetricsSummary from "@/components/MetricsSummary";
import EventVolumeChart from "@/components/EventVolumeChart";
import EventBreakdownChart from "@/components/EventBreakdownChart";
import LiveEventFeed from "@/components/LiveEventFeed";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import {
  fetchMetricsSummary,
  fetchHourlyStats,
  fetchRecentEvents,
  triggerSimulate,
  computeHourly,
} from "@/lib/api";
import type { MetricsSummary as MetricsSummaryType, HourlyBucket, Event } from "@/lib/api";

const POLL_INTERVAL = 5_000;

export default function DashboardPage() {
  const [summary, setSummary] = useState<MetricsSummaryType | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [hourly, setHourly] = useState<HourlyBucket[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [computing, setComputing] = useState(false);

  const fetchAll = useCallback(async () => {
    const [s, ev, h] = await Promise.allSettled([
      fetchMetricsSummary(),
      fetchRecentEvents(200),
      fetchHourlyStats(72),
    ]);
    if (s.status === "fulfilled") setSummary(s.value);
    if (ev.status === "fulfilled") setEvents(ev.value.data);
    if (h.status === "fulfilled") setHourly(h.value);
    setLastUpdated(new Date());
  }, []);

  // Initial fetch + 5-second polling
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (!cancelled) await fetchAll();
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fetchAll]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await triggerSimulate(100);
      await fetchAll();
    } finally {
      setSimulating(false);
    }
  };

  const handleComputeHourly = async () => {
    setComputing(true);
    try {
      await computeHourly();
      await fetchAll();
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-900 border border-gray-800 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()} · refreshes every 5s`
              : "Connecting to FastAPI backend…"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleComputeHourly}
            disabled={computing}
            className="px-3 py-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {computing ? "Computing…" : "Compute Hourly Stats"}
          </button>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-40"
          >
            {simulating ? "Simulating…" : "Simulate Events"}
          </button>
        </div>
      </div>

      {/* ── Row 1: Metric cards ── */}
      <MetricsSummary summary={summary} />

      {/* ── Row 2: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2">
          <EventVolumeChart events={events} hourly={hourly} />
        </div>
        <div>
          <EventBreakdownChart summary={summary} />
        </div>
      </div>

      {/* ── Row 3: Feed + AI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <LiveEventFeed events={events.slice(0, 20)} />
        <AIInsightsPanel />
      </div>
    </div>
  );
}
