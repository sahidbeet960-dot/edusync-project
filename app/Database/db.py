from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:Tks26@localhost:5432/edusync_ai"

#engine of the databse 
engine = create_async_engine(
    DATABASE_URL,
    echo=True
)

#local session to perform CRUD operations
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

        