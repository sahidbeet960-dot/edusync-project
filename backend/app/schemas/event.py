from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime  # The frontend will send a string like "2026-03-15T10:00:00Z"
    location: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_date: datetime
    location: Optional[str]
    organizer_id: int
    created_at: datetime

    class Config:
        from_attributes = True