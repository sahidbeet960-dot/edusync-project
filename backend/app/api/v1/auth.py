from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db
from app.models.users import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email is already taken
    query = select(User).where(User.email == user_data.email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # 2. Hash password and insert into Postgres(we are using postgres)
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        department=user_data.department,  
        semester=user_data.semester,
        bio=user_data.bio                 
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user) # Retrieves the newly generated ID
    
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    #1. find username from db
    query = select(User).where(User.email == user_credentials.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    
    #2. verify password
    if not verify_password(user_credentials.password, user.hashed_password): # type: ignore
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
        
    # 3. Generate JWT Token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}