from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, Text


class Base(DeclarativeBase):
    pass


class FileModel(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    filename = Column(String)
    path = Column(String)
    namespace = Column(String)
    file_hash = Column(String, unique=True)

class ChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True)
    document_id = Column(Text)
    chunk_index = Column(Integer)
    content = Column(Text)