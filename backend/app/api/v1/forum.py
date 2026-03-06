from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.core.storage import upload_material_to_cloud
from app.models.forum import Question, Answer, AnswerVote
from app.models.users import User, RoleEnum
from app.schemas.forum import (
    QuestionCreate, QuestionResponse, QuestionDetailResponse, 
    AnswerCreate, AnswerResponse, VoteCreate
)
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    title: str = Form(...),            # <--- CHANGED THIS
    content: str = Form(...),          # <--- CHANGED THIS
    file: Optional[UploadFile] = File(None), # Optional file upload
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_url = None
    
    # 1. Upload the physical file to Cloudinary if it exists
    if file:
        file_url = await upload_material_to_cloud(file)
    
    new_question = Question(
        title=title,
        content=content,
        file_url=file_url, # Save the file URL in the question record
        author_id=current_user.id
    )
    
    db.add(new_question)
    await db.commit()
    await db.refresh(new_question)
    return new_question




@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(db: AsyncSession = Depends(get_db)):
    query = select(Question).order_by(Question.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()



@router.get("/questions/{question_id}", response_model=QuestionDetailResponse)
async def get_question(question_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Question).where(Question.id == question_id).options(selectinload(Question.answers))
    result = await db.execute(query)
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    return question




@router.post("/questions/{question_id}/answers", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_answer(
    question_id: int,
    answer: AnswerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question_query = select(Question).where(Question.id == question_id)
    result = await db.execute(question_query)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Question not found")

    new_answer = Answer(
        content=answer.content,
        question_id=question_id,
        author_id=current_user.id,
        is_professor_verified=(current_user.role == "PROFESSOR")
    )
    
    db.add(new_answer)
    await db.commit()
    await db.refresh(new_answer)
    return new_answer




@router.post("/answers/{answer_id}/vote")
async def vote_on_answer(
    answer_id: int,
    vote_data: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Find the answer
    answer_query = select(Answer).where(Answer.id == answer_id)
    result = await db.execute(answer_query)
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    # 2. Check if this user has already voted on this answer
    vote_query = select(AnswerVote).where(
        AnswerVote.answer_id == answer_id
    ).where(
        AnswerVote.user_id == current_user.id
    )
    vote_result = await db.execute(vote_query)
    existing_vote = vote_result.scalar_one_or_none()

    # 3. Calculate the math
    if existing_vote:
        # Revert the old vote's impact on the totals
        if existing_vote.vote == 1: # type: ignore
            answer.upvotes -= 1 # type: ignore
        elif existing_vote.vote == -1: # type: ignore
            answer.downvotes -= 1 # type: ignore

        # Apply the new vote
        if vote_data.vote == 0:
            await db.delete(existing_vote) # 0 means remove vote
        else:
            existing_vote.vote = vote_data.vote # type: ignore
            if vote_data.vote == 1:
                answer.upvotes += 1 # type: ignore
            elif vote_data.vote == -1:
                answer.downvotes += 1 # type: ignore
    else:
        # First time voting!
        if vote_data.vote != 0:
            new_vote = AnswerVote(
                user_id=current_user.id, 
                answer_id=answer_id, 
                vote=vote_data.vote
            )
            db.add(new_vote)
            if vote_data.vote == 1:
                answer.upvotes += 1 # type: ignore
            elif vote_data.vote == -1:
                answer.downvotes += 1 # type: ignore

    await db.commit()
    await db.refresh(answer)
    
    return {
        "message": "Vote registered", 
        "upvotes": answer.upvotes, 
        "downvotes": answer.downvotes
    }
    

@router.patch("/answers/{answer_id}/verify")
async def verify_answer(
    answer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Strictly lock this to Professors and Admins (No CRs allowed)
    if current_user.role not in [RoleEnum.PROFESSOR, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can mark answers as official."
        )
    
    result = await db.execute(select(Answer).where(Answer.id == answer_id))
    answer = result.scalar_one_or_none()

    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found.")

    answer.is_professor_verified = True # type: ignore

    try:
        await db.commit()
        await db.refresh(answer)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to verify answer.")

    return {"success": True, "is_professor_verified": answer.is_professor_verified}

@router.patch("/answers/{answer_id}/unverify")
async def unverify_answer(
    answer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Strictly lock this to Professors and Admins
    if current_user.role not in [RoleEnum.PROFESSOR, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can unmark answers."
        )
    
    result = await db.execute(select(Answer).where(Answer.id == answer_id))
    answer = result.scalar_one_or_none()

    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found.")

    answer.is_professor_verified = False # type: ignore

    try:
        await db.commit()
        await db.refresh(answer)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to unverify answer.")

    return {"success": True, "is_professor_verified": answer.is_professor_verified}