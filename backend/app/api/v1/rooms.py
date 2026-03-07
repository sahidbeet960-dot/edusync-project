from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, cast, Date
from datetime import date, datetime, timezone
import json
import time

from app.core.socket_manager import manager
from app.core.database import get_db
from app.models.study import StudySession

router = APIRouter(tags=["Study Rooms"])

@router.websocket("/ws/{room_id}")
async def study_room_websocket(
    websocket: WebSocket, 
    room_id: str, 
    username: str, 
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    await manager.connect(websocket, room_id)
    
    
    # 1. Calculate how many seconds they ALREADY studied TODAY
    try:
        today = date.today()
        query = select(func.sum(StudySession.duration_seconds)).where(
            StudySession.user_id == user_id,
            cast(StudySession.created_at, Date) == today
        )
        result = await db.execute(query)
        today_base_seconds = result.scalar() or 0
    except Exception:
        today_base_seconds = 0


    # 2. Add them to Redis with their base time
    join_time = await manager.add_user_to_room(room_id, username, today_base_seconds)
    
    
    # 3. Get everyone currently in the room
    active_users = await manager.get_active_users(room_id)
    
    
    # 4. Send the LIVE STATE to the newly joined user
    init_msg = {
        "type": "room_state",
        "users": active_users
    }
    await websocket.send_text(json.dumps(init_msg))
    
    
    # 5. Tell everyone else that someone joined
    join_msg = {
        "type": "system", 
        "username": username, 
        "message": "joined the room",
        "action": "join",
        "join_time": join_time,
        "today_base": today_base_seconds
    }
    await manager.publish_to_room(room_id, json.dumps(join_msg))
    
    try:
        while True:
            data = await websocket.receive_json()
            data["username"] = username
            await manager.publish_to_room(room_id, json.dumps(data))
            
    except WebSocketDisconnect:
        # 6. Read their join_time from Redis BEFORE removing them
        user_data = await manager.get_user_data(room_id, username)

        if user_data:
            session_duration = int(time.time()) - user_data["join_time"]
            if session_duration >= 10:
                try:
                    new_session = StudySession(
                        user_id=user_id,
                        room_id=room_id,
                        duration_seconds=session_duration
                    )
                    db.add(new_session)
                    await db.commit()
                except Exception:
                    await db.rollback()


        # 7. Remove from the Redis
        await manager.remove_user_from_room(room_id, username)

        # 8. Publish leave BEFORE removing the socket — so the room still exists
        #    to receive and forward the message to remaining users
        leave_msg = {
            "type": "system", 
            "username": username, 
            "message": "left the room",
            "action": "leave"
        }
        await manager.publish_to_room(room_id, json.dumps(leave_msg))


        # 9. NOW disconnect the socket (may delete room from active_connections)
        manager.disconnect(websocket, room_id)