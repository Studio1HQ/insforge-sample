"use client";

import { useState, useRef, useCallback } from "react";
import { streamInsight } from "@/lib/api";

export default function AIInsightsPanel() {
  const [query, setQuery] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    // Stop if already streaming
    if (streaming) {
      abortRef.current?.abort();
      return; // finally block will setStreaming(false)
    }

    const q =
      query.trim() ||
      "Analyze the event data and highlight key trends, anomalies, and recommendations.";

    setContent("");
    setSaved(false);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const chunk of streamInsight(q, controller.signal)) {
        setContent((prev) => prev + chunk);
      }
      setSaved(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setContent((prev) => `${prev}\n\n[Error: ${err.message}]`);
      }
    } finally {
      setStreaming(false);
    }
  }, [streaming, query]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">AI Insights</h2>
        <span className="text-xs text-gray-600">
          claude-sonnet-4.5 · InsForge
        </span>
      </div>

      {/* Query input */}
      <div className="flex gap-2 items-start">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
          placeholder="Ask anything about your event data…"
          rows={2}
          disabled={streaming}
          className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            streaming
              ? "bg-red-600/80 hover:bg-red-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}
        >
          {streaming ? "Stop" : "Generate"}
        </button>
      </div>

      {/* Streaming output */}
      <div className="min-h-48 max-h-80 overflow-y-auto rounded-lg bg-gray-800/40 border border-gray-800 p-4 text-sm leading-relaxed">
        {!content && !streaming && (
          <p className="text-gray-600 italic text-xs">
            Enter a question and click Generate — responses stream word by word.
            <br />
            <span className="text-gray-700">⌘ + Enter to submit.</span>
          </p>
        )}

        {streaming && !content && (
          <span className="text-gray-500 text-xs animate-pulse">
            Connecting to InsForge AI gateway…
          </span>
        )}

        {content && (
          <div className="text-gray-300 whitespace-pre-wrap">
            {content}
            {streaming && (
              <span className="inline-block w-[2px] h-[14px] bg-indigo-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}

        {saved && (
          <p className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-600">
            ✓ Saved to ai_insights table
          </p>
        )}
      </div>
    </div>
  );
}
