from typing import AsyncGenerator

import httpx

from config import INSFORGE_BASE_URL, INSFORGE_ANON_KEY

AI_MODEL = "anthropic/claude-sonnet-4.5"


class InsForgeClient:
    def __init__(self) -> None:
        self.base_url = INSFORGE_BASE_URL
        self._anon_key = INSFORGE_ANON_KEY

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._anon_key}",
            "Content-Type": "application/json",
        }

    # ------------------------------------------------------------------
    # Database helpers
    # ------------------------------------------------------------------

    async def get_records(
        self, table: str, params: dict | None = None
    ) -> tuple[list, int | None]:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.get(
                f"{self.base_url}/api/database/records/{table}",
                headers=self._headers,
                params=params or {},
            )
            resp.raise_for_status()
            raw_total = resp.headers.get("X-Total-Count")
            return resp.json(), int(raw_total) if raw_total else None

    async def create_records(self, table: str, records: list) -> list:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{self.base_url}/api/database/records/{table}",
                headers={**self._headers, "Prefer": "return=representation"},
                json=records,
            )
            resp.raise_for_status()
            return resp.json()

    async def upsert_records(self, table: str, records: list) -> list:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{self.base_url}/api/database/records/{table}",
                headers={
                    **self._headers,
                    "Prefer": "resolution=merge-duplicates,return=representation",
                },
                json=records,
            )
            resp.raise_for_status()
            return resp.json()

    async def delete_records(
        self, table: str, params: dict, return_records: bool = True
    ) -> list:
        prefer = "return=representation" if return_records else "return=minimal"
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.delete(
                f"{self.base_url}/api/database/records/{table}",
                headers={**self._headers, "Prefer": prefer},
                params=params,
            )
            if resp.status_code == 204:
                return []
            resp.raise_for_status()
            return resp.json() if return_records else []

    # ------------------------------------------------------------------
    # AI helper — yields raw SSE lines from the InsForge AI gateway
    # ------------------------------------------------------------------

    async def ai_stream(
        self,
        messages: list,
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        payload: dict = {
            "model": AI_MODEL,
            "messages": messages,
            "stream": True,
        }
        if system_prompt:
            payload["systemPrompt"] = system_prompt

        async with httpx.AsyncClient(timeout=120) as http:
            async with http.stream(
                "POST",
                f"{self.base_url}/api/ai/chat/completion",
                headers=self._headers,
                json=payload,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        yield line + "\n\n"


# Shared singleton used by all routers
insforge = InsForgeClient()
