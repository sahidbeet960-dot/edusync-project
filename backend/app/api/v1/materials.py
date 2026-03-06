from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.materials import Material
from app.models.users import User, RoleEnum
from app.schemas.material import MaterialCreate, MaterialResponse
from app.api.dependencies import get_current_user
from app.core.storage import upload_material_to_cloud # Import our new service


router = APIRouter()

@router.post("/")
async def upload_material(
    title: str = Form(...),
    description: str = Form(None),
    semester: int = Form(...),
    tags: str = Form(None),
    file: UploadFile = File(...), # <--- This catches the actual PDF!
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Upload the physical file to Cloudinary
    file_url = await upload_material_to_cloud(file)

    # 2. Save the details AND the new URL to PostgreSQL
    new_material = Material(
        title=title,
        description=description,
        semester=semester,
        tags=tags,
        file_url=file_url, # <--- Save the live cloud link
        uploader_id=current_user.id
    )
    
    db.add(new_material)
    await db.commit()
    await db.refresh(new_material)
    
    # FIXED: Only return the ID to prevent the JSON serialization crash!
    return {"success": True, "material": {"id": new_material.id}}



@router.get("/", response_model=List[MaterialResponse])
async def get_materials(
    semester: int = None, # Optional query parameter to filter by semester # type: ignore
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # PROTECTED ROUTE
):
    query = select(Material)
    
    # If a semester is provided, filter the results
    if semester:
        query = query.where(Material.semester == semester)
        
    result = await db.execute(query)
    materials = result.scalars().all()
    
    return materials


#--------------------------------------------------------- Verify / Unverify -----------------------------------------------------#
@router.patch("/{material_id}/verify", response_model=MaterialResponse)
async def verify_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. SECURITY CHECK: Only CRs, Professors, and Admins can verify
    allowed_roles = [RoleEnum.CR, RoleEnum.PROFESSOR, RoleEnum.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to verify materials."
        )

    # 2. Fetch the material
    result = await db.execute(select(Material).where(Material.id == material_id))
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found."
        )

    # 3. Update verification status and record who verified it
    material.is_verified = True  # type: ignore
    material.verified_by_id = current_user.id

    try:
        await db.commit()
        await db.refresh(material)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify material."
        )

    return material

@router.patch("/{material_id}/unverify", response_model=MaterialResponse)
async def unverify_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow same roles to un-verify in case of a mistake
    allowed_roles = [RoleEnum.CR, RoleEnum.PROFESSOR, RoleEnum.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to unverify materials."
        )

    result = await db.execute(select(Material).where(Material.id == material_id))
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found."
        )

    # Revert verification status
    material.is_verified = False  # type: ignore
    material.verified_by_id = None # type: ignore

    try:
        await db.commit()
        await db.refresh(material)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unverify material."
        )

    return material


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # SECURITY CHECK: Only the uploader or admins can delete a material
    allowed_roles = [RoleEnum.ADMIN, RoleEnum.PROFESSOR, RoleEnum.CR]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete materials."
        )
    
    
    # Only the uploader or admins can delete a material
    query = select(Material).where(Material.id == material_id)
    result = await db.execute(query)
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found."
        )


    try:
        await db.delete(material)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete material."
        )

    return {"success": True, "message": "Material deleted successfully."}