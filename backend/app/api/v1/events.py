from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.events import Event
from app.models.users import User, RoleEnum
from app.schemas.event import EventCreate, EventResponse
from app.api.dependencies import get_current_user

router = APIRouter(tags=["Event Calendar"])

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new event. Only CRs, Professors, and Admins can do this."""
    
    # --- Role-Based Security (Only Student vcan't write for now)---
    if current_user.role == RoleEnum.STUDENT: # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only CRs, Professors, or Admins can create official events."
        )

    new_event = Event(
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        location=event.location,
        organizer_id=current_user.id
    )
    
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event


@router.get("/", status_code=status.HTTP_200_OK, response_model=List[EventResponse])
async def get_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # Must be logged in to view
):
    """Get all events, ordered by the closest upcoming date."""
    
    # Fetch events and sort them so the soonest event is at the top of the list!
    query = select(Event).order_by(Event.event_date.asc())
    result = await db.execute(query)
    events = result.scalars().all()
    
    return events