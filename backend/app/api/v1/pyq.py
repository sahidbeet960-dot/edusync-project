from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.core.storage import upload_material_to_cloud
from app.models.pyq import PYQPaper
from app.models.users import User, RoleEnum
from app.schemas.pyq import PYQResponse
from app.api.dependencies import get_current_user
from app.models.pyq import ExtractedExamData, TopicImportance
from app.schemas.pyq import ExtractedDataCreate, TopicImportanceUpdate, TopicImportanceResponse

router = APIRouter()

@router.post("/", response_model=PYQResponse)
async def upload_pyq(
    subject: str = Form(...),
    year: int = Form(...),
    semester: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    # --- Role-Based Security (Only Student can't write for now)---
    if current_user.role == RoleEnum.STUDENT: # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only CRs, Professors, or Admins can create official events."
        )
        
        
    # 1. Upload the PDF to Cloudinary (using your existing core storage logic)
    file_url = await upload_material_to_cloud(file)
    if not file_url:
        raise HTTPException(status_code=500, detail="Failed to upload file to Cloudinary")

    # 2. Save the record to PostgreSQL
    new_pyq = PYQPaper(
        subject=subject,
        year=year,
        semester=semester,
        file_url=file_url,
        uploader_id=current_user.id
    )
    
    db.add(new_pyq)
    await db.commit()
    await db.refresh(new_pyq)
    return new_pyq

@router.get("/", response_model=List[PYQResponse])
async def get_all_pyqs(
    semester: int = None,  # type: ignore
    subject: str = None, # type: ignore 
    db: AsyncSession = Depends(get_db)
):
    """
    can pass ?semester=4&subject=Math to filter the results.
    """
    query = select(PYQPaper)
    
    if semester:
        query = query.where(PYQPaper.semester == semester)
    if subject:
        # ilike makes the search case-insensitive
        query = query.where(PYQPaper.subject.ilike(f"%{subject}%"))
        
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{pyq_id}", status_code=204)
async def delete_pyq(
    pyq_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific PYQ by its ID. 
    Restricted to CRs and Professors.
    """
    # 1. Security Check
    if current_user.role == RoleEnum.STUDENT: # type: ignore
        raise HTTPException(status_code=403, detail="Not authorized to delete PYQs")

    # 2. Fetch the existing PYQ
    result = await db.execute(select(PYQPaper).where(PYQPaper.id == pyq_id))
    db_pyq = result.scalar_one_or_none()

    if not db_pyq:
        raise HTTPException(status_code=404, detail="PYQ not found")

    # 3. Delete from the database
    await db.delete(db_pyq)
    await db.commit()
    
    return None


@router.post("/analytics/extract", status_code=201)
async def save_extracted_data(
    data: ExtractedDataCreate,
    db: AsyncSession = Depends(get_db)
):
    """AI hits this endpoint after processing a PDF."""
    new_extraction = ExtractedExamData(
        document_id=data.document_id,
        topic=data.topic,
        marks=data.marks,
        frequency=data.frequency
    )
    db.add(new_extraction)
    await db.commit()
    return {"message": "Extracted data saved successfully"}


@router.get("/analytics/topics/{subject}", response_model=List[TopicImportanceResponse])
async def get_topic_importance(
    subject: str,
    db: AsyncSession = Depends(get_db)
):
    """The Frontend hits this to build the Probability Map UI."""
    # Fetch topics for the subject, ordered by highest marks first
    query = select(TopicImportance).where(
        TopicImportance.subject.ilike(f"%{subject}%")
    ).order_by(TopicImportance.total_marks_contribution.desc())
    
    result = await db.execute(query)
    return result.scalars().all()