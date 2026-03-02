from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Query

from client import insforge

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/summary")
async def get_summary():
    """
    Aggregate totals across all events:
    total count, unique users/sessions, event breakdown, top pages.
    """
    records, total = await insforge.get_records(
        "events",
        {"limit": 1000, "select": "event_name,user_id,session_id,page"},
    )

    event_counts = Counter(r["event_name"] for r in records)
    unique_users = len({r["user_id"] for r in records if r["user_id"]})
    unique_sessions = len({r["session_id"] for r in records if r["session_id"]})
    page_counts = Counter(r["page"] for r in records if r["page"])

    return {
        "total_events": total or len(records),
        "unique_users": unique_users,
        "unique_sessions": unique_sessions,
        "events_by_name": dict(event_counts.most_common()),
        "top_pages": dict(page_counts.most_common(10)),
    }


@router.get("/hourly")
async def get_hourly_stats(
    event_name: str | None = None,
    limit: int = Query(168, ge=1, le=1000, description="Default = last 7 days (168 h)"),
):
    """Return pre-computed hourly buckets from event_hourly_stats."""
    params: dict = {"limit": limit, "order": "bucket_start.desc"}
    if event_name:
        params["event_name"] = f"eq.{event_name}"

    records, _ = await insforge.get_records("event_hourly_stats", params)
    return records


@router.post("/hourly/compute")
async def compute_hourly_stats():
    """
    Read raw events, bucket them into hourly slots, then upsert into
    event_hourly_stats (unique on event_name + bucket_start).
    """
    records, _ = await insforge.get_records(
        "events",
        {"limit": 1000, "select": "event_name,created_at"},
    )

    buckets: dict[tuple, int] = defaultdict(int)
    for r in records:
        dt = datetime.fromisoformat(r["created_at"].replace("Z", "+00:00"))
        bucket_ts = dt.replace(minute=0, second=0, microsecond=0).isoformat()
        buckets[(r["event_name"], bucket_ts)] += 1

    if not buckets:
        return {"upserted": 0}

    rows = [
        {"event_name": name, "bucket_start": bucket_ts, "count": count}
        for (name, bucket_ts), count in buckets.items()
    ]

    result = await insforge.upsert_records("event_hourly_stats", rows)
    return {"upserted": len(result)}
