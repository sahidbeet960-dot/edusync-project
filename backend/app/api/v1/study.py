from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.study import StudySession
from app.models.users import User
from app.schemas.study import StudySessionCreate, StudySessionResponse
from app.api.dependencies import get_current_user

router = APIRouter(tags=["Study Stats"])

@router.post("/sessions", response_model=StudySessionResponse)
async def save_study_session(
    session_data: StudySessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Saves a completed study session to the database."""
    new_session = StudySession(
        user_id=current_user.id,
        room_id=session_data.room_id,
        duration_seconds=session_data.duration_seconds
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.get("/my-stats")
async def get_my_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculates the total time this user has studied."""
    # This SQL query asks Postgres to sum up the duration_seconds column for this specific user
    query = select(func.sum(StudySession.duration_seconds)).where(StudySession.user_id == current_user.id)
    result = await db.execute(query)
    
    # Extract the sum (it might be None if they have never studied)
    total_seconds = result.scalar() or 0
    
    return {
        "user_id": current_user.id,
        "total_study_seconds": total_seconds,
        "total_study_minutes": total_seconds // 60
    }