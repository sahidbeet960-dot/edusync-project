from pydantic import BaseModel
from datetime import datetime

class StudySessionCreate(BaseModel):
    room_id: str
    duration_seconds: int

class StudySessionResponse(BaseModel):
    id: int
    user_id: int
    room_id: str
    duration_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True