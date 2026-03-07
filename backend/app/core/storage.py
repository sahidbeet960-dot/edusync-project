import cloudinary # type: ignore
import cloudinary.uploader # type: ignore
import os
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

load_dotenv()


# Configure Cloudinary using environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def upload_material_to_cloud(file: UploadFile) -> str:
    """Uploads a file to Cloudinary and returns the secure public URL."""
    try:
        # resource_type="auto" automatically detects if it is a PDF, Image, or Video
        result = cloudinary.uploader.upload(
            file.file, 
            resource_type="auto",
            folder="edusync_materials" # Keeps your cloud storage organized
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")