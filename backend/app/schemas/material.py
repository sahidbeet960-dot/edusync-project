from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MaterialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str  # The Cloudinary URL where the frontend uploaded the PDF
    semester: int
    tags: Optional[str] = None

class MaterialResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    file_url: str
    semester: int
    tags: Optional[str]
    is_verified: bool
    uploader_id: int
    verified_by_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True