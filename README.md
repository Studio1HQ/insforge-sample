# InsForge Analytics

A full-stack real-time analytics dashboard built on [InsForge](https://insforge.app). It tracks user events, computes hourly metrics, and generates AI-powered insights built with claude code — all streamed live to the browser.

```
insforge-sample/
├── main.py                  # FastAPI entry point
├── config.py                # Environment configuration
├── client.py                # InsForge API client (DB + AI)
├── requirements.txt         # Python dependencies
├── Dockerfile               # Backend container image
├── routers/
│   ├── events.py            # Event CRUD
│   ├── metrics.py           # Aggregated metrics & hourly stats
│   ├── insights.py          # AI insight generation (SSE)
│   └── simulate.py          # Fake event generator
└── frontend/
    ├── Dockerfile           # Frontend container image
    ├── next.config.mjs
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx         # Main dashboard (polling every 5s)
    ├── components/
    │   ├── MetricsSummary.tsx
    │   ├── EventVolumeChart.tsx
    │   ├── EventBreakdownChart.tsx
    │   ├── LiveEventFeed.tsx
    │   └── AIInsightsPanel.tsx
    └── lib/
        └── api.ts           # Typed fetch helpers + SSE streaming
```

---

## How it works

```
Browser (Next.js)
  │  polls every 5 s
  ▼
FastAPI backend
  │  reads / writes via REST
  ▼
InsForge (Postgres + AI gateway)
  ├── events table          — raw event log
  ├── event_hourly_stats    — pre-computed hourly buckets
  └── ai_insights           — saved Claude responses
```

The frontend polls the FastAPI backend every 5 seconds to keep metrics and charts fresh. When the user requests an AI insight, the backend fetches event context, calls the InsForge AI gateway (Claude Sonnet 4.5), and streams the response back token-by-token via Server-Sent Events.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, httpx |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts |
| Database | InsForge (Postgres via REST) |
| AI | Claude Sonnet 4.5 via InsForge AI gateway (SSE) |
| Containerisation | Docker (multi-stage for frontend) |

---

## Database schema

### `events`
Stores every tracked user action.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `event_name` | text | e.g. `page_view`, `click`, `purchase` |
| `user_id` | text | Opaque user identifier |
| `session_id` | text | Opaque session identifier |
| `page` | text | URL path where the event occurred |
| `referrer` | text | Referring URL (nullable) |
| `properties` | jsonb | Event-specific payload |
| `created_at` | timestamptz | Defaults to `now()` |

### `event_hourly_stats`
Pre-computed event counts bucketed by hour. Populated by `POST /metrics/hourly/compute`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `event_name` | text | |
| `bucket_start` | timestamptz | Truncated to the hour |
| `count` | integer | Events in this bucket |

Unique constraint on `(event_name, bucket_start)` — upsert-safe.

### `ai_insights`
Persisted AI-generated analysis responses.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `insight_type` | text | e.g. `trend`, `anomaly` |
| `title` | text | First 80 chars of the user query |
| `content` | text | Full Claude response |
| `time_range` | text | e.g. `24h` |
| `metadata` | jsonb | Snapshot stats at generation time |
| `created_at` | timestamptz | |

---

## API reference

Base URL (local): `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/` | Returns `{"status": "ok"}` |

### Events — `/events`

| Method | Path | Description |
|---|---|---|
| GET | `/events` | List events. Query params: `limit`, `offset`, `event_name`, `user_id`, `page`, `order` |
| POST | `/events` | Track a new event |
| GET | `/events/{id}` | Fetch a single event |
| DELETE | `/events/{id}` | Delete a single event |

**POST `/events` body**
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

### Metrics — `/metrics`

| Method | Path | Description |
|---|---|---|
| GET | `/metrics/summary` | Totals: event count, unique users/sessions, breakdown by name, top 10 pages |
| GET | `/metrics/hourly` | Hourly buckets from `event_hourly_stats`. Params: `event_name`, `limit` (default 168 = 7 days) |
| POST | `/metrics/hourly/compute` | Read raw events → bucket by hour → upsert into `event_hourly_stats` |

### AI Insights — `/insights`

| Method | Path | Description |
|---|---|---|
| GET | `/insights` | List saved insights. Params: `limit`, `offset`, `insight_type` |
| POST | `/insights/generate` | Generate a new insight via Claude. Returns an SSE stream |
| DELETE | `/insights/{id}` | Delete a saved insight |

**POST `/insights/generate` body**
```json
{
  "query": "What are the biggest drop-off points in the user journey?",
  "time_range": "24h",
  "insight_type": "trend",
  "save": true
}
```

**SSE response format**
```
data: {"chunk": "Based on the data..."}
data: {"chunk": " I can see that..."}
data: {"tokenUsage": {"input_tokens": 412, "output_tokens": 310}}
data: {"done": true}
```

When `save: true`, the full response is persisted to `ai_insights` after the stream completes.

### Simulate — `/simulate`

| Method | Path | Description |
|---|---|---|
| POST | `/simulate/events` | Generate and insert fake events |
| DELETE | `/simulate/reset` | Delete all rows from the `events` table |

**POST `/simulate/events` body**
```json
{
  "count": 100,
  "event_types": ["page_view", "click", "purchase"],
  "days_back": 7
}
```

Generates realistic events spread over the past `days_back` days, clustered across a proportional pool of users and sessions. Inserts in batches of 100.

---

## Local development

### Prerequisites

- Python 3.11+
- Node.js 20+
- An InsForge project with the three tables above created

### 1. Clone and configure the backend

```bash
git clone <repo-url>
cd insforge-sample
```

Create a `.env` file at the project root:

```env
INSFORGE_BASE_URL=https://<your-project>.us-east.insforge.app
INSFORGE_ANON_KEY=<your-anon-key>
```

### 2. Run the backend

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

### 3. Configure and run the frontend

```bash
cd frontend
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm install
npm run dev
```

The dashboard will be at `http://localhost:3000`.

### 4. Seed some data

Open the dashboard and click **Simulate Events** to generate 100 fake events, then click **Compute Hourly Stats** to populate the charts. Alternatively, use the API directly:

```bash
# Insert 200 events spread over 14 days
curl -X POST http://localhost:8000/simulate/events \
  -H "Content-Type: application/json" \
  -d '{"count": 200, "days_back": 14}'

# Compute hourly buckets
curl -X POST http://localhost:8000/metrics/hourly/compute
```

---

## Environment variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `INSFORGE_BASE_URL` | Yes | Base URL of your InsForge project |
| `INSFORGE_ANON_KEY` | Yes | Anonymous JWT from your InsForge project settings |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Public URL of the FastAPI backend. Baked in at build time |

> `NEXT_PUBLIC_*` variables are embedded into the JavaScript bundle during `npm run build`. The value must be set **before** the build runs, not just at runtime.

---

## Deployment (Zeabur)

The project is structured as two independent services for Zeabur — each has its own `Dockerfile`.

### Backend service

1. Create a new **Zeabur service** pointing to the repo root (`insforge-sample/`).
2. Zeabur will detect the `Dockerfile` automatically.
3. Set these environment variables in Zeabur's service settings:
   - `INSFORGE_BASE_URL`
   - `INSFORGE_ANON_KEY`
4. Note the public domain Zeabur assigns (e.g. `https://api.your-app.zeabur.app`).

### Frontend service

1. Create a second **Zeabur service** pointing to the `frontend/` subdirectory.
2. Zeabur will detect `frontend/Dockerfile`.
3. Set the build-time environment variable:
   - `NEXT_PUBLIC_API_URL` = the backend's public URL from step 4 above.
4. Deploy.

> Because `NEXT_PUBLIC_API_URL` is baked in at build time, if you ever change the backend URL you must **redeploy the frontend** with the updated value.

### Docker (manual / self-hosted)

**Backend**
```bash
docker build -t insforge-api .
docker run -p 8000:8000 \
  -e INSFORGE_BASE_URL=https://<your-project>.us-east.insforge.app \
  -e INSFORGE_ANON_KEY=<your-key> \
  insforge-api
```

**Frontend**
```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -t insforge-frontend .
docker run -p 3000:3000 insforge-frontend
```

---

## Frontend dashboard

The single-page dashboard auto-refreshes every 5 seconds and includes:

- **Metric cards** — total events, unique users, unique sessions, and most frequent event type
- **Event Volume chart** — hourly event counts over the past 72 hours (area chart)
- **Event Breakdown chart** — distribution of event types (pie chart)
- **Live Event Feed** — the 20 most recent events with timestamps and properties
- **AI Insights panel** — freeform query box that streams a Claude-generated analysis of your current event data

---

## Key implementation notes

- **SSE streaming** — `InsForgeClient.ai_stream()` yields raw SSE lines from the InsForge AI gateway. The insights router accumulates text chunks in memory and saves the full response to `ai_insights` only after the stream ends, ensuring the save never blocks delivery to the client.
- **Metrics aggregation** — `GET /metrics/summary` fetches up to 1,000 events and aggregates them with Python `Counter` / `set`. This is intentionally simple and works well for datasets up to ~10k events.
- **Hourly stats** — `POST /metrics/hourly/compute` is a manual trigger (also callable from the dashboard). For production use, schedule it with a cron job or Zeabur's scheduled tasks.
- **Batch inserts** — `POST /simulate/events` inserts in batches of 100 records to stay within InsForge's payload limits.
- **Upsert safety** — `event_hourly_stats` uses `Prefer: resolution=merge-duplicates` so re-running the compute endpoint is idempotent.
