from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_url = Column(String, nullable=False)        # Will point to Cloud storage
    semester = Column(Integer, nullable=False)
    tags = Column(String, nullable=True)         # Storing as a comma-separated string
    is_verified = Column(Boolean, default=False)
    
    # Foreign Keys linking to the User table
    uploader_id = Column(Integer, ForeignKey("users.id"))
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (Optional, but makes querying much easier later)
    uploader = relationship("User", foreign_keys=[uploader_id])
    verifier = relationship("User", foreign_keys=[verified_by_id])