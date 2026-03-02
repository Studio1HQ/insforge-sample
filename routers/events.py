from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from client import insforge

router = APIRouter(prefix="/events", tags=["events"])


class EventCreate(BaseModel):
    event_name: str
    user_id: str | None = None
    session_id: str | None = None
    page: str | None = None
    referrer: str | None = None
    properties: dict[str, Any] = {}


@router.get("")
async def list_events(
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    event_name: str | None = None,
    user_id: str | None = None,
    page: str | None = None,
    order: str = "created_at.desc",
):
    """List events with optional filtering by event_name, user_id, or page."""
    params: dict = {"limit": limit, "offset": offset, "order": order}
    if event_name:
        params["event_name"] = f"eq.{event_name}"
    if user_id:
        params["user_id"] = f"eq.{user_id}"
    if page:
        params["page"] = f"eq.{page}"

    records, total = await insforge.get_records("events", params)
    return {"data": records, "total": total, "limit": limit, "offset": offset}


@router.post("", status_code=201)
async def create_event(event: EventCreate):
    """Track a new event."""
    created = await insforge.create_records("events", [event.model_dump()])
    return created[0] if created else {}


@router.get("/{event_id}")
async def get_event(event_id: str):
    """Retrieve a single event by ID."""
    records, _ = await insforge.get_records(
        "events", {"id": f"eq.{event_id}", "limit": 1}
    )
    if not records:
        raise HTTPException(status_code=404, detail="Event not found")
    return records[0]


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str):
    """Delete an event by ID."""
    records, _ = await insforge.get_records(
        "events", {"id": f"eq.{event_id}", "limit": 1}
    )
    if not records:
        raise HTTPException(status_code=404, detail="Event not found")
    await insforge.delete_records("events", {"id": f"eq.{event_id}"})
