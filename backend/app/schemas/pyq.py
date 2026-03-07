from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PYQResponse(BaseModel):
    id: int
    subject: str
    year: int
    semester: int
    file_url: str
    uploader_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        

# What AI will POST to your backend
class ExtractedDataCreate(BaseModel):
    document_id: int
    topic: str
    marks: int
    frequency: int = 1

class TopicImportanceUpdate(BaseModel):
    topic_name: str
    subject: str
    total_marks_contribution: int
    appearance_count: int
    priority_level: str

# What the React/Flutter frontend will fetch
class TopicImportanceResponse(BaseModel):
    topic_name: str
    subject: str
    total_marks_contribution: int
    appearance_count: int
    priority_level: str
    
    class Config:
        from_attributes = True