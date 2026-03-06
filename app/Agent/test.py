from langchain.tools import tool
from langchain.agents import create_agent
from pydantic import BaseModel,Field
from app.models.model import chat_model


llm=chat_model()

class FileUpload(BaseModel):
    title:str=Field(description="Title of the file uploaded")
    file_description:str
    semester:int
    tags:str

def upload_docs():
    """
    Upload_docs tool is used to upload files by the user.
    But before calling this tools ask for the requirement details
    """

