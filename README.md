<div align="center">

<img src="https://raw.githubusercontent.com/Studio1HQ/Studio1HQ/main/assets/banners/insforge-sample.webp" alt="Real-Time Analytics Dashboard with InsForge: Track events, compute hourly metrics and stream AI insights" width="100%" />

<br />
<br />

# Real-Time Analytics Dashboard with InsForge

### Track events, compute hourly metrics and stream AI insights

A FastAPI and Next.js analytics dashboard on InsForge. It stores user events in InsForge Postgres, computes hourly stats, and streams Claude-generated insights through the InsForge AI gateway.

<br />

[![Built by Studio1](https://img.shields.io/badge/Built_by_Studio1-f97316?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMzVDMCAxNi42ODA3IDE0LjA3NDQgMS42NDg0NCAzMiAwLjEyNjk1M1YxNDFINTEuMDUyM0M1Mi40MzA4IDEzNy4zNDQgNTQuNzQ0NiAxMzMuNjg5IDU3Ljk5MzggMTMwLjAzM0M2MS4xNDQ2IDEyNi41MDggNjQuNjg5MiAxMjMuNDQgNjguNjI3NyAxMjAuODI5QzcyLjU2NjIgMTE4LjM0OSA3Ni4zNTY5IDExNi43ODIgODAgMTE2LjEyOVY4Ni43NTQ0Qzc1LjQ3MDggODcuOTI5MiA3MS4zODQ2IDg5LjY5MTkgNjcuNzQxNSA5Mi4wNDE1QzY0IDk0LjUyMjUgNjAuNzUwOCA5Ny40NiA1Ny45OTM4IDEwMC44NTRDNTYuNTM0NSAxMDIuNzIgNTUuMjU0NSAxMDQuNjU5IDU0LjE1MzkgMTA2LjY3MVYwSDEyNUMxNDQuMzMgMCAxNjAgMTUuNjY5OSAxNjAgMzVWMTI1QzE2MCAxNDQuMzMgMTQ0LjMzIDE2MCAxMjUgMTYwSDEyNFYxOEgxMDQuOTQ4QzEwMy41NjkgMjEuNjgxNiAxMDEuMjU1IDI1LjM2MjggOTguMDA2MiAyOS4wNDQ0Qzk0Ljg1NTQgMzIuNTk0MiA5MS4zMTA4IDM1LjY4NDEgODcuMzcyMyAzOC4zMTRDODMuNDMzOCA0MC44MTIgNzkuNjQzMSA0Mi4zODk2IDc2IDQzLjA0NzRWNzIuNjMwNEM4MC41MjkyIDcxLjQ0NzMgODQuNjE1NCA2OS42NzI0IDg4LjI1ODUgNjcuMzA1N0M5MiA2NC44MDc2IDk1LjI0OTIgNjEuODQ5MSA5OC4wMDYyIDU4LjQzMDdDOTkuNDY1NSA1Ni41NTEzIDEwMC43NDUgNTQuNTk4NiAxMDEuODQ2IDUyLjU3MjNWMTYwSDM1QzE1LjY3IDE2MCAwIDE0NC4zMyAwIDEyNVYzNVoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4K)](https://studio1hq.com)
[![Built with InsForge](https://img.shields.io/badge/Built_with_InsForge-141414?style=for-the-badge)](https://insforge.dev)

[InsForge docs](https://docs.insforge.dev) &nbsp;·&nbsp; [InsForge](https://insforge.dev) &nbsp;·&nbsp; [More examples](https://github.com/Studio1HQ) &nbsp;·&nbsp; [studio1hq.com](https://studio1hq.com)

</div>

<br />

## Overview

InsForge Analytics is a full-stack, real-time analytics dashboard built on [InsForge](https://insforge.dev). A FastAPI backend tracks user events, computes hourly metrics and generates AI insights. A Next.js dashboard polls the backend every 5 seconds and streams insights live.

InsForge is used as Postgres over REST for the data and as the AI gateway for Claude Sonnet 4.5. The AI insights feature was built with Claude Code.

<p align="center"><img src="https://github.com/user-attachments/assets/b811ccd5-8c44-4418-9391-dbeb27038a73" alt="InsForge Analytics dashboard" width="100%" /></p>

## Features

- **Event tracking**: Create, list, fetch and delete events through a REST API.
- **Summary metrics**: Totals, unique users and sessions, breakdown by event name and top 10 pages.
- **Hourly stats**: Pre-computed hourly buckets in `event_hourly_stats`, upsert-safe so re-running is idempotent.
- **Streamed AI insights**: The backend sends event context to Claude Sonnet 4.5 via the InsForge AI gateway and streams tokens to the browser over Server-Sent Events.
- **Saved insights**: Responses can be persisted to `ai_insights` after the stream ends.
- **Data simulator**: Generate fake events across a number of days with one call or one button.
- **Live dashboard**: Metric cards, an event volume area chart, an event type pie chart, a live feed of the 20 latest events and an AI insights panel.

## Tech stack

| Layer | Tool |
| --- | --- |
| Backend | Python 3.11, [FastAPI](https://fastapi.tiangolo.com), httpx |
| Frontend | [Next.js](https://nextjs.org/) 14, React 18, TypeScript, [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/) |
| Database | [InsForge](https://insforge.dev) (Postgres via REST) |
| AI | Claude Sonnet 4.5 through the InsForge AI gateway (SSE) |
| Packaging | Docker (multi-stage for the frontend) |
| Deployment | [Zeabur](https://zeabur.com) (two services), or Docker |

## Getting started

### Prerequisites

- Python 3.11 or later
- Node.js 20 or later
- An InsForge project with the three tables from [Database schema](#database-schema) created

### Installation

```bash
git clone https://github.com/Studio1HQ/insforge-sample.git
cd insforge-sample
pip install -r requirements.txt
cd frontend && npm install
```

### Environment variables

Backend, in a `.env` file at the project root:

| Variable | Required | Description |
| --- | --- | --- |
| `INSFORGE_BASE_URL` | Yes | Base URL of your InsForge project, for example `https://<your-project>.us-east.insforge.app`. |
| `INSFORGE_ANON_KEY` | Yes | Anonymous JWT from your InsForge project settings. |

Frontend, in `frontend/.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Public URL of the FastAPI backend, for example `http://localhost:8000`. Baked in at build time. |

`NEXT_PUBLIC_*` values are embedded into the JavaScript bundle during `npm run build`, so set the value before the build, not just at runtime.

### Run

Backend, from the project root. The API is at `http://localhost:8000` with interactive docs at `/docs`:

```bash
uvicorn main:app --reload
```

Frontend, in a second terminal. The dashboard is at `http://localhost:3000`:

```bash
cd frontend
npm run dev
```

Seed some data: open the dashboard, click **Simulate Events** to create 100 fake events, then **Compute Hourly Stats** to fill the charts. Or use the API:

```bash
curl -X POST http://localhost:8000/simulate/events \
  -H "Content-Type: application/json" \
  -d '{"count": 200, "days_back": 14}'

curl -X POST http://localhost:8000/metrics/hourly/compute
```

## How it works

```text
Browser (Next.js)
  |  polls every 5 s
  v
FastAPI backend
  |  reads / writes via REST
  v
InsForge (Postgres + AI gateway)
  |- events            raw event log
  |- event_hourly_stats  pre-computed hourly buckets
  '- ai_insights       saved Claude responses
```

When you request an insight, the backend fetches event context, calls the InsForge AI gateway and streams the response back token by token.

```text
insforge-sample/
├── main.py            # FastAPI entry point
├── config.py          # Environment configuration
├── client.py          # InsForge API client (DB + AI)
├── routers/
│   ├── events.py      # Event CRUD
│   ├── metrics.py     # Aggregated metrics and hourly stats
│   ├── insights.py    # AI insight generation (SSE)
│   └── simulate.py    # Fake event generator
└── frontend/
    ├── app/page.tsx   # Main dashboard (polls every 5 s)
    ├── components/    # MetricsSummary, EventVolumeChart, EventBreakdownChart, LiveEventFeed, AIInsightsPanel
    └── lib/api.ts     # Typed fetch helpers and SSE streaming
```

### Database schema

`events` stores every tracked user action.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key, auto-generated |
| `event_name` | text | For example `page_view`, `click`, `purchase` |
| `user_id` | text | Opaque user identifier |
| `session_id` | text | Opaque session identifier |
| `page` | text | URL path where the event occurred |
| `referrer` | text | Referring URL (nullable) |
| `properties` | jsonb | Event-specific payload |
| `created_at` | timestamptz | Defaults to `now()` |

`event_hourly_stats` holds event counts per hour, populated by `POST /metrics/hourly/compute`. It has a unique constraint on `(event_name, bucket_start)`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `event_name` | text | |
| `bucket_start` | timestamptz | Truncated to the hour |
| `count` | integer | Events in this bucket |

`ai_insights` stores AI-generated analysis.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `insight_type` | text | For example `trend`, `anomaly` |
| `title` | text | First 80 characters of the user query |
| `content` | text | Full Claude response |
| `time_range` | text | For example `24h` |
| `metadata` | jsonb | Snapshot stats at generation time |
| `created_at` | timestamptz | |

### API reference

Base URL (local): `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Health check, returns `{"status": "ok"}` |
| GET | `/events` | List events. Params: `limit`, `offset`, `event_name`, `user_id`, `page`, `order` |
| POST | `/events` | Track a new event |
| GET | `/events/{id}` | Fetch one event |
| DELETE | `/events/{id}` | Delete one event |
| GET | `/metrics/summary` | Totals, unique users and sessions, breakdown by name, top 10 pages |
| GET | `/metrics/hourly` | Hourly buckets. Params: `event_name`, `limit` (default 168, 7 days) |
| POST | `/metrics/hourly/compute` | Bucket raw events by hour and upsert into `event_hourly_stats` |
| GET | `/insights` | List saved insights. Params: `limit`, `offset`, `insight_type` |
| POST | `/insights/generate` | Generate an insight with Claude. Returns an SSE stream |
| DELETE | `/insights/{id}` | Delete a saved insight |
| POST | `/simulate/events` | Generate and insert fake events |
| DELETE | `/simulate/reset` | Delete all rows from `events` |

`POST /events` body:

```json
{
  "event_name": "page_view",
  "user_id": "user_abc123",
  "session_id": "sess_xyz",
  "page": "/pricing",
  "referrer": "https://google.com",
  "properties": {}
}
```

`POST /insights/generate` body:

```json
{
  "query": "What are the biggest drop-off points in the user journey?",
  "time_range": "24h",
  "insight_type": "trend",
  "save": true
}
```

SSE response format. With `save: true`, the full response is written to `ai_insights` after the stream completes.

```text
data: {"chunk": "Based on the data..."}
data: {"chunk": " I can see that..."}
data: {"tokenUsage": {"input_tokens": 412, "output_tokens": 310}}
data: {"done": true}
```

`POST /simulate/events` body. It spreads events over the past `days_back` days across a proportional pool of users and sessions, inserting in batches of 100.

```json
{
  "count": 100,
  "event_types": ["page_view", "click", "purchase"],
  "days_back": 7
}
```

### Implementation notes

- **SSE streaming**: `InsForgeClient.ai_stream()` yields raw SSE lines from the InsForge AI gateway. The insights router accumulates text and saves it only after the stream ends, so saving never blocks delivery.
- **Metrics aggregation**: `GET /metrics/summary` reads up to 1,000 events and aggregates in Python with `Counter` and `set`. This is simple and fine up to about 10k events.
- **Hourly stats**: The compute endpoint is a manual trigger. For production, schedule it with a cron job or Zeabur scheduled tasks.
- **Batch inserts**: Simulated events are inserted in batches of 100 to stay within InsForge payload limits.
- **Upsert safety**: `event_hourly_stats` uses `Prefer: resolution=merge-duplicates`, so the compute endpoint is idempotent.

### Deployment

**Zeabur.** The project is two independent services, each with its own `Dockerfile`.

1. Backend: create a Zeabur service from the repo root. Zeabur detects the `Dockerfile`. Set `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY`, then note the public domain it assigns.
2. Frontend: create a second service pointing at `frontend/`. Zeabur detects `frontend/Dockerfile`. Set the build-time variable `NEXT_PUBLIC_API_URL` to the backend's public URL, then deploy.

Because `NEXT_PUBLIC_API_URL` is baked in at build time, redeploy the frontend if the backend URL changes.

**Docker (manual).**

```bash
# Backend
docker build -t insforge-api .
docker run -p 8000:8000 \
  -e INSFORGE_BASE_URL=https://<your-project>.us-east.insforge.app \
  -e INSFORGE_ANON_KEY=<your-key> \
  insforge-api

# Frontend
cd frontend
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 -t insforge-frontend .
docker run -p 3000:3000 insforge-frontend
```

## Resources

- [InsForge docs](https://docs.insforge.dev): database, AI gateway and API reference.
- [InsForge](https://insforge.dev): the backend platform used here.
- [FastAPI](https://fastapi.tiangolo.com): the backend framework.
- [Recharts](https://recharts.org/): the charting library.

<br />

---

<div align="center">

<a href="https://studio1hq.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-dark.svg" />
    <img src="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-light.svg" alt="Studio1" width="160" />
  </picture>
</a>

Built by **[Studio1](https://studio1hq.com)**, the technical content and DevRel partner for devtool teams. Made with [InsForge](https://insforge.dev).<br />
Browse more open-source examples at [github.com/Studio1HQ](https://github.com/Studio1HQ).

[![Website](https://img.shields.io/badge/studio1hq.com-0b0807?style=for-the-badge&logo=googlechrome&logoColor=white)](https://studio1hq.com)
[![Book a call](https://img.shields.io/badge/Book_a_strategy_call-f97316?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://cal.com/studio1/collab)
[![X](https://img.shields.io/badge/%40Studio1HQ-141414?style=for-the-badge&logo=x&logoColor=white)](https://x.com/Studio1HQ)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/studio1hq/)

<sub><a href="https://studio1hq.com">studio1hq.com</a> · Technical content, docs, video and DevRel for devtools</sub>

</div>
