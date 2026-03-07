from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class PYQPaper(Base):
    __tablename__ = "pyq_papers"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    file_url = Column(String, nullable=False)
    
    # Track who uploaded it
    uploader_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the User table
    uploader = relationship("User")