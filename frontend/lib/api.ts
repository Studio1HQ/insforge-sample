const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MetricsSummary {
  total_events: number;
  unique_users: number;
  unique_sessions: number;
  events_by_name: Record<string, number>;
  top_pages: Record<string, number>;
}

export interface HourlyBucket {
  id: string;
  event_name: string;
  bucket_start: string;
  count: number;
}

export interface Event {
  id: string;
  event_name: string;
  user_id: string | null;
  session_id: string | null;
  page: string | null;
  referrer: string | null;
  properties: Record<string, unknown>;
  created_at: string;
}

// ── Fetchers ───────────────────────────────────────────────────────────────

export async function fetchMetricsSummary(): Promise<MetricsSummary> {
  const res = await fetch(`${API_BASE}/metrics/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch metrics summary");
  return res.json();
}

export async function fetchHourlyStats(limit = 72): Promise<HourlyBucket[]> {
  const res = await fetch(`${API_BASE}/metrics/hourly?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch hourly stats");
  return res.json();
}

export async function fetchRecentEvents(
  limit = 200
): Promise<{ data: Event[]; total: number }> {
  const res = await fetch(
    `${API_BASE}/events?limit=${limit}&order=created_at.desc`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function triggerSimulate(count = 100): Promise<void> {
  await fetch(`${API_BASE}/simulate/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
}

export async function computeHourly(): Promise<void> {
  await fetch(`${API_BASE}/metrics/hourly/compute`, { method: "POST" });
}

// ── SSE streaming ──────────────────────────────────────────────────────────

export async function* streamInsight(
  query: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/insights/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, time_range: "24h", insight_type: "trend", save: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        try {
          const parsed = JSON.parse(payload);
          if (typeof parsed.chunk === "string") yield parsed.chunk;
          if (parsed.done) return;
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
