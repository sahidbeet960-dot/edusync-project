from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query , Depends
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List
import os,json
from pathlib import Path
from dotenv import load_dotenv  
from app.core.config import s3_client ,S3_BUCKET ,S3_REGION
load_dotenv()

# === Chat Services ===
from app.ChatBot.services.vector_service import create_vectorstore_from_files
from app.ChatBot.services.chat_services import chat_with_namespace
import uuid # for session id
import tempfile

from fastapi import APIRouter


# ==== Postgres Databse ===
from sqlalchemy.ext.asyncio import AsyncSession
from app.Database.data_validation import calculate_hash
from sqlalchemy import select
from app.Database.db import get_db
from app.Database.models import FileModel, ChunkModel

router=APIRouter()



# ===============================
# PYDANTIC MODELS (For JSON Bodies) # you may insert in schemas
# ===============================
class ChatRequest(BaseModel):
    namespace: str
    user_message: str
    session_id: str

class FileRequest(BaseModel):
    namespace: str

class ChunkRequest(BaseModel):
    document_id: str


# ===============================
# 1. UPLOAD ROUTE (Single File)
# ===============================
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):  
    #hard-coded need to change for unique conversation
    user_id="Tushar"

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    content = await file.read()

    file_hash = calculate_hash(content)

    # Check duplicate file
    result = await db.execute(
        select(FileModel).where(FileModel.file_hash == file_hash)
    )

    existing_file = result.scalar_one_or_none()

    if existing_file:
        session_id = str(uuid.uuid4())
        return {
            "status": "already_exists",
            "namespace": existing_file.namespace,
            "session_id": session_id
        }

    # ---------- Upload to S3 ----------
    s3_key = f"{file_hash}_{file.filename}"

    s3_client.put_object(
        Bucket=S3_BUCKET,
        Key=s3_key,
        Body=content,
        ContentType="application/pdf"
    )

    # S3 file URL
    s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"

    namespace = f"user_{file_hash[:8]}"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        temp_path = tmp.name

    #embedding generation
    try:

        create_vectorstore_from_files(
            [temp_path], 
            namespace=namespace
        )
        
        # ---------- Save Metadata in Postgres ----------
        new_file = FileModel(
            user_id=user_id,
            filename=file.filename,
            path=s3_url,   # store S3 URL 
            namespace=namespace,
            file_hash=file_hash
        )

        db.add(new_file)
        await db.commit()
        await db.refresh(new_file)

        session_id = str(uuid.uuid4())
        return {
            "status": "uploaded",
            "namespace": namespace,
            "session_id": session_id
        }
            

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ===============================
# 2️.CHAT ROUTE (RAG)
# ===============================
@router.post("/chat")
async def chat(request: ChatRequest):

    response = chat_with_namespace(
        user_message=request.user_message,
        namespace=request.namespace,
        session_id=request.session_id
    )

    return {"response": response}