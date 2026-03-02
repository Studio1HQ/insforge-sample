import random
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

from client import insforge

router = APIRouter(prefix="/simulate", tags=["simulate"])

_EVENT_TYPES = [
    "page_view", "click", "scroll", "signup", "login", "logout",
    "purchase", "add_to_cart", "remove_from_cart", "search",
    "video_play", "video_pause", "form_submit", "download", "share", "error",
]

_PAGES = [
    "/", "/home", "/about", "/pricing", "/docs", "/blog",
    "/login", "/signup", "/dashboard", "/profile", "/settings", "/checkout",
]

_REFERRERS = [
    "https://google.com", "https://twitter.com", "https://github.com",
    "https://linkedin.com", "https://reddit.com",
    None, None, None,  # weight towards direct traffic
]


def _short_id(prefix: str = "") -> str:
    return prefix + uuid.uuid4().hex[:8]


def _event_properties(event_name: str) -> dict:
    if event_name == "purchase":
        return {"amount": round(random.uniform(9.99, 299.99), 2), "currency": "USD"}
    if event_name == "search":
        return {"query": random.choice(["python", "fastapi", "analytics", "dashboard", "pricing", "docs"])}
    if event_name == "error":
        return {"code": random.choice([400, 401, 403, 404, 500]), "message": "An error occurred"}
    if event_name in ("video_play", "video_pause"):
        return {"video_id": _short_id("vid_"), "position_seconds": random.randint(0, 3600)}
    if event_name == "add_to_cart":
        return {"product_id": _short_id("prod_"), "price": round(random.uniform(4.99, 199.99), 2)}
    return {}


class SimulateRequest(BaseModel):
    count: int = Field(50, ge=1, le=500, description="Number of events to generate")
    event_types: list[str] | None = Field(None, description="Subset of event types to use")
    days_back: int = Field(7, ge=1, le=90, description="Spread events over this many past days")


@router.post("/events")
async def simulate_events(req: SimulateRequest):
    """Generate and insert realistic fake events into InsForge."""
    event_types = req.event_types or _EVENT_TYPES

    # Build a realistic user/session pool so events cluster naturally
    user_pool = [_short_id("user_") for _ in range(max(1, req.count // 8))]
    session_pool = [_short_id("sess_") for _ in range(max(1, req.count // 4))]

    now = datetime.now(timezone.utc)
    records = []

    for _ in range(req.count):
        event_name = random.choice(event_types)
        created_at = now - timedelta(seconds=random.randint(0, req.days_back * 86_400))

        records.append(
            {
                "event_name": event_name,
                "user_id": random.choice(user_pool),
                "session_id": random.choice(session_pool),
                "page": random.choice(_PAGES),
                "referrer": random.choice(_REFERRERS),
                "properties": _event_properties(event_name),
                "created_at": created_at.isoformat(),
            }
        )

    # Insert in batches of 100 to stay within payload limits
    inserted = 0
    for i in range(0, len(records), 100):
        await insforge.create_records("events", records[i : i + 100])
        inserted += len(records[i : i + 100])

    return {
        "inserted": inserted,
        "event_types_used": list(set(r["event_name"] for r in records)),
        "users_generated": len(user_pool),
    }


@router.delete("/reset")
async def reset_events():
    """
    Delete all rows from the events table.
    Uses a filter that matches every row (created_at is never null).
    """
    await insforge.delete_records(
        "events",
        {"created_at": "gte.1970-01-01T00:00:00.000Z"},
        return_records=False,  # skip returning the payload to avoid large responses
    )
    return {"message": "All events have been deleted"}
