import asyncio
import json
import os
import time
from typing import Dict, List, Optional
from fastapi import WebSocket
import redis.asyncio as redis # type: ignore

class RedisConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        self.listen_task = None

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            await self.pubsub.subscribe(room_id)
            
            if self.listen_task is None:
                self.listen_task = asyncio.create_task(self._listen_to_redis())
                
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            try:
                self.active_connections[room_id].remove(websocket)
            except ValueError:
                pass
            
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                asyncio.create_task(self.pubsub.unsubscribe(room_id)) # type: ignore

    async def publish_to_room(self, room_id: str, message: str):
        await self.redis.publish(room_id, message)

    async def _listen_to_redis(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                room_id = message["channel"]
                data = message["data"]
                
                if room_id in self.active_connections:
                    # Snapshot the list — prevents crash if someone disconnects mid-loop
                    connections = list(self.active_connections[room_id])
                    for connection in connections:
                        try:
                            await connection.send_text(data)
                        except Exception:
                            pass
                        
    async def add_user_to_room(self, room_id: str, username: str, today_base: int) -> int:
        join_time = int(time.time())
        user_data = json.dumps({
            "join_time": join_time,
            "today_base": today_base
        })
        await self.redis.hset(f"room_state:{room_id}", username, user_data) # type: ignore
        return join_time

    async def get_user_data(self, room_id: str, username: str) -> Optional[dict]:
        raw = await self.redis.hget(f"room_state:{room_id}", username) # type: ignore
        if raw is None:
            return None
        return json.loads(raw)

    async def remove_user_from_room(self, room_id: str, username: str):
        await self.redis.hdel(f"room_state:{room_id}", username) # type: ignore

    async def get_active_users(self, room_id: str) -> dict:
        raw_data = await self.redis.hgetall(f"room_state:{room_id}") # type: ignore
        return {username: json.loads(data) for username, data in raw_data.items()}

manager = RedisConnectionManager()