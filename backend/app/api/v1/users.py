from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.models.users import User

from app.api.dependencies import get_current_user
from app.schemas.user import UserProfileResponse, UserProfileUpdate, UserResponse
from pydantic import BaseModel



router = APIRouter(tags=["Users"])

class RoleUpdate(BaseModel):
    new_role: str 

@router.patch("/{target_user_id}/role")
async def update_user_role(
    target_user_id: int,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Check against the exact Caps! (Use current_user.role.value if it returns an Enum object)
    if current_user.role != "ADMIN":  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Security Error: Only admins can change user roles."
        )
    
    # 2. Force uppercase to perfectly match your Enum
    requested_role = role_data.new_role.upper() 
    valid_roles = ["ADMIN", "PROFESSOR", "CR", "STUDENT"]
    
    if requested_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    # 3. Find the user
    target_user = await db.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    # 4. Make the change and save!
    target_user.role = requested_role # type: ignore
    await db.commit()

    return {
        "success": True, 
        "message": f"User promoted to {requested_role}!"
    }
    
    

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    update_data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Convert request to dictionary, ignoring missing fields
    update_dict = update_data.model_dump(exclude_unset=True)

    if not update_dict:
        return current_user # Return unchanged if they sent empty JSON

    # 2. Apply changes dynamically
    for key, value in update_dict.items():
        setattr(current_user, key, value)

    # 3. Save to database
    try:
        await db.commit()
        await db.refresh(current_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile."
        )

    return current_user