from sqlalchemy import Column, Integer, String, Enum, Boolean, Text
import enum
from .base import Base

class RoleEnum(str, enum.Enum):
    STUDENT = "STUDENT"
    CR = "CR"
    PROFESSOR = "PROFESSOR"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # --- NEW FIELDS ---
    department = Column(String, nullable=True) # e.g., "BCSE"
    semester = Column(Integer, nullable=True)  # e.g., 4
    bio = Column(Text, nullable=True)          # e.g., "Passionate about 8085 Microprocessors"