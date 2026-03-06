from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AnswerCreate(BaseModel):
    content: str

class AnswerResponse(BaseModel):
    id: int
    content: str
    upvotes: int
    downvotes: int
    is_professor_verified: bool
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    title: str
    content: str

class QuestionResponse(BaseModel):
    id: int
    title: str
    content: str
    file_url: Optional[str] = None
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionDetailResponse(QuestionResponse):
    answers: List[AnswerResponse] = []
    
    
class VoteCreate(BaseModel):
    # Send 1 to upvote, -1 to downvote, or 0 to remove a vote completely
    vote: int