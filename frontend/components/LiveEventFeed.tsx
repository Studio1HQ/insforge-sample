"use client";

import type { Event } from "@/lib/api";

const EVENT_BADGE: Record<string, string> = {
  page_view: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  click: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  signup: "bg-green-500/15 text-green-400 border-green-500/25",
  login: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  logout: "bg-gray-500/15 text-gray-400 border-gray-500/25",
  purchase: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  add_to_cart: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  remove_from_cart: "bg-red-500/15 text-red-400 border-red-500/25",
  search: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  video_play: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  form_submit: "bg-lime-500/15 text-lime-400 border-lime-500/25",
  error: "bg-red-500/15 text-red-400 border-red-500/25",
};
const DEFAULT_BADGE = "bg-gray-500/15 text-gray-400 border-gray-500/25";

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

interface Props {
  events: Event[];
}

export default function LiveEventFeed({ events }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300">Live Event Feed</h2>
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          polling every 5s
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16 text-gray-600 text-sm">
          No events yet — click Simulate Events
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-72 pr-1 scrollbar-thin">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/60 transition-colors"
            >
              <span
                className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border ${
                  EVENT_BADGE[event.event_name] ?? DEFAULT_BADGE
                }`}
              >
                {event.event_name}
              </span>
              <span className="min-w-0 flex-1 text-xs text-gray-500 truncate">
                {event.user_id ?? "anon"} · {event.page ?? "—"}
              </span>
              <span className="shrink-0 text-xs text-gray-700 tabular-nums">
                {relativeTime(event.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
