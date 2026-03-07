from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.users import RoleEnum


## creating all possible user args schemas that might need in future
# What the frontend sends to register
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: RoleEnum = RoleEnum.STUDENT # Defaults to student if not provided
    # Optional fields so registration doesn't break if omitted
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None

# What the frontend sends to login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What your API returns upon successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str



# What your API returns when grabbing user info (excludes the password!)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: RoleEnum
    # Added here so the frontend can read the user's current info
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True
        
        
class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    role: RoleEnum
    # Added here so public profiles show this info
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None
    total_materials_uploaded: int
    total_questions_asked: int
    total_verified_answers: int
    total_study_minutes: int

    class Config:
        from_attributes = True


# NEW: What the frontend sends to edit the profile (PATCH /me)
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None