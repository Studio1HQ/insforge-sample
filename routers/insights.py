import json
from collections import Counter

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from client import insforge

router = APIRouter(prefix="/insights", tags=["insights"])

_SYSTEM_PROMPT = (
    "You are an expert product analytics consultant. "
    "You will receive a structured summary of user event data and a specific question. "
    "Provide clear, concise, and actionable insights. "
    "Structure your response with labeled sections (e.g. ## Key Findings, ## Recommendations). "
    "Be specific — reference actual numbers from the data where relevant."
)


class InsightRequest(BaseModel):
    query: str = "Analyze the event data and highlight key trends, anomalies, and recommendations."
    time_range: str = "24h"
    insight_type: str = "trend"
    save: bool = True


@router.get("")
async def list_insights(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    insight_type: str | None = None,
):
    """List previously saved AI insights."""
    params: dict = {"limit": limit, "offset": offset, "order": "created_at.desc"}
    if insight_type:
        params["insight_type"] = f"eq.{insight_type}"

    records, total = await insforge.get_records("ai_insights", params)
    return {"data": records, "total": total}


@router.post("/generate")
async def generate_insight(req: InsightRequest):
    """
    Stream an AI-generated insight about your event data via SSE.

    The response is a Server-Sent Events stream:
      data: {"chunk": "..."} — incremental text token
      data: {"tokenUsage": {...}} — final usage stats
      data: {"done": true} — stream complete

    When save=true the full response is persisted to ai_insights.
    """
    # Fetch enough data to give the model meaningful context
    events, total = await insforge.get_records(
        "events",
        {"limit": 200, "select": "event_name,user_id,session_id,page,created_at,properties"},
    )
    hourly, _ = await insforge.get_records(
        "event_hourly_stats",
        {"limit": 48, "order": "bucket_start.desc"},
    )

    event_counts = Counter(e["event_name"] for e in events)
    page_counts = Counter(e["page"] for e in events if e["page"])
    unique_users = len({e["user_id"] for e in events if e["user_id"]})
    unique_sessions = len({e["session_id"] for e in events if e["session_id"]})

    context = (
        f"## Analytics Context (time_range: {req.time_range})\n\n"
        f"- Total events in database: {total or len(events)}\n"
        f"- Unique users: {unique_users}\n"
        f"- Unique sessions: {unique_sessions}\n"
        f"- Event breakdown: {json.dumps(dict(event_counts.most_common(15)))}\n"
        f"- Top pages: {json.dumps(dict(page_counts.most_common(10)))}\n"
        f"- Recent hourly buckets (newest first): {json.dumps(hourly[:12], default=str)}\n\n"
        f"## User Question\n{req.query}"
    )

    async def stream_and_save():
        accumulated: list[str] = []

        async for sse_line in insforge.ai_stream(
            messages=[{"role": "user", "content": context}],
            system_prompt=_SYSTEM_PROMPT,
        ):
            # Accumulate text chunks so we can save after streaming
            data_str = sse_line.removeprefix("data: ").strip()
            try:
                parsed = json.loads(data_str)
                if "chunk" in parsed:
                    accumulated.append(parsed["chunk"])
            except (json.JSONDecodeError, KeyError):
                pass

            yield sse_line

        # Persist the full response once streaming is complete
        if req.save and accumulated:
            full_text = "".join(accumulated)
            title = req.query[:80] + ("…" if len(req.query) > 80 else "")
            try:
                await insforge.create_records(
                    "ai_insights",
                    [
                        {
                            "insight_type": req.insight_type,
                            "title": title,
                            "content": full_text,
                            "time_range": req.time_range,
                            "metadata": {
                                "total_events": total,
                                "unique_users": unique_users,
                                "unique_sessions": unique_sessions,
                                "event_breakdown": dict(event_counts.most_common(5)),
                            },
                        }
                    ],
                )
            except Exception:
                # Don't let a save failure break the already-delivered stream
                pass

    return StreamingResponse(
        stream_and_save(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/{insight_id}", status_code=204)
async def delete_insight(insight_id: str):
    """Delete a saved insight by ID."""
    records, _ = await insforge.get_records(
        "ai_insights", {"id": f"eq.{insight_id}", "limit": 1}
    )
    if not records:
        raise HTTPException(status_code=404, detail="Insight not found")
    await insforge.delete_records("ai_insights", {"id": f"eq.{insight_id}"})
