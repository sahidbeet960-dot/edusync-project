from fastapi import FastAPI
from app.api.v1 import auth, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduSync API Gateway", 
    description="Core backend for Byte Force",
    version="1.0.0"
)

# --- CORS block ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with the frontend's live URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------

# This registers your auth endpoints under the /api/v1/auth prefix
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users")

@app.get("/")
async def root():
    return {"status": "success", "message": "EduSync Backend is live!"}