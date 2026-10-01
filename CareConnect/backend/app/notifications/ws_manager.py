import asyncio
import json
from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Map request_id -> set of WebSocket connections
        self.active: Dict[int, Set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, request_id: int, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            conns = self.active.get(request_id) or set()
            conns.add(websocket)
            self.active[request_id] = conns

    async def disconnect(self, request_id: int, websocket: WebSocket):
        async with self.lock:
            conns = self.active.get(request_id)
            if not conns:
                return
            if websocket in conns:
                conns.remove(websocket)
            if len(conns) == 0:
                self.active.pop(request_id, None)
            else:
                self.active[request_id] = conns

    async def broadcast_to_request(self, request_id: int, message: dict):
        text = json.dumps(message, default=str)
        async with self.lock:
            conns = list(self.active.get(request_id, []))

        for ws in conns:
            try:
                await ws.send_text(text)
            except Exception:
                # best-effort: ignore send failures
                try:
                    await self.disconnect(request_id, ws)
                except Exception:
                    pass


manager = ConnectionManager()
