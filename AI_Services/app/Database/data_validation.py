from pydantic import BaseModel, Field
import hashlib

#Data contain in each tuple of the table
class FileData(BaseModel):
    user_id: int = Field(..., description="ID of the user uploading the file")
    namespace: str = Field(..., description="Vector DB namespace")
    filename: str = Field(..., description="Original name of the file")
    file_path: str = Field(..., description="Path where file is stored")
    file_hash: str = Field(..., description="SHA256 hash of the file")


def calculate_hash(content: bytes):
    return hashlib.sha256(content).hexdigest()