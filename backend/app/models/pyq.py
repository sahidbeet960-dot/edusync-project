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
    


class ExtractedExamData(Base):
    __tablename__ = "extracted_exam_data"

    id = Column(Integer, primary_key=True, index=True)
    # Link directly to the PYQ paper table!
    document_id = Column(Integer, ForeignKey("pyq_papers.id"), nullable=False)
    topic = Column(String, nullable=False)
    marks = Column(Integer, default=0)
    frequency = Column(Integer, default=1)
    extracted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the paper
    paper = relationship("PYQPaper")


class TopicImportance(Base):
    __tablename__ = "topic_importance"

    topic_name = Column(String, primary_key=True, index=True)
    subject = Column(String, index=True)
    total_marks_contribution = Column(Integer, default=0)
    appearance_count = Column(Integer, default=0)
    priority_level = Column(String)  # 'High', 'Medium', or 'Low'
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())