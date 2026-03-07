from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# echo=True prints the raw SQL to your terminal
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# This creates the database sessions we will use in our endpoints
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency to inject the DB session into FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session