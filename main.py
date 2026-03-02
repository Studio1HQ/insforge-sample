from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import events, insights, metrics, simulate

app = FastAPI(
    title="InsForge Analytics API",
    version="1.0.0",
    description="FastAPI backend for InsForge — events, metrics, AI insights, and simulation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(metrics.router)
app.include_router(insights.router)
app.include_router(simulate.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "InsForge Analytics API is running"}
