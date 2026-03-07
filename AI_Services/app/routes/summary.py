from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query , Depends
from fastapi.encoders import jsonable_encoder
from typing import List
import os,json
from pathlib import Path
from dotenv import load_dotenv  

load_dotenv()

import uuid # for session id
import tempfile

# === Summary Services ===
from app.Summarize.chain import summary_chain
from app.models.model import chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel
from app.Infographs.chunks import get_chunks 

# ==== Postgres Databse ===
from sqlalchemy.ext.asyncio import AsyncSession
from app.Database.data_validation import calculate_hash
from sqlalchemy import select
from app.Database.db import get_db
from app.Database.models import FileModel, ChunkModel
from fastapi import APIRouter

router=APIRouter()

class ChunkRequest(BaseModel):
    document_id: str


# ===============================
# 1.UPLOAD SUMMARY
# ===============================
@router.post("/summary/upload")
async def upload_summary(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    user_id = "Tushar"

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    content = await file.read()
    
    # calculate_hash likely returns a string hash, not an object with an .id property
    doc_hash = calculate_hash(content) 

    # check duplicate
    result = await db.execute(
    select(ChunkModel.document_id)
    .where(ChunkModel.document_id == doc_hash)
    .limit(1)
    )
    existing_file = result.scalar_one_or_none()

    if existing_file:
        return {
            "status": "already_exists",
            "document_id": doc_hash
        }

    # -------- create temp file --------
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        temp_path = tmp.name

    try:
        # -------- chunk document --------
        chunks = get_chunks(temp_path)

        # -------- store in ChunkModel DB --------
        for i, chunk in enumerate(chunks):

            if hasattr(chunk, "page_content"):
                text = chunk.page_content
            else:
                text = chunk

            db.add(
                ChunkModel(
                    document_id=doc_hash,
                    chunk_index=i,
                    content=text
                )
            )

        await db.commit() # Commit all chunks at once

        return {
            "status": "uploaded",
            "document_id": doc_hash
        }

    except Exception as e:
        await db.rollback() # CRITICAL: Rollback the session on error to prevent DB hangs
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Ensure temp file is removed even if code crashes
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ===============================
# 2.SUMMARY GENERATION
# ===============================
@router.post("/summary")
async def generate_summary(
    request: ChunkRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
    select(ChunkModel.content)
    .where(ChunkModel.document_id == request.document_id)
    .order_by(ChunkModel.chunk_index)
    )

    rows = result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")

    text = "\n\n".join(rows)
    
    chain= summary_chain()
    summary = chain.invoke({"text":text})

    return jsonable_encoder(summary)

