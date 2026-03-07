from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(String, nullable=False) # e.g., 'sem4'
    
    # We save seconds because it's the most accurate. 
    # The frontend will convert it to hours/minutes later.
    duration_seconds = Column(Integer, nullable=False) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")