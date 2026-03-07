from pinecone import Pinecone
import os

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

INDEX_NAME = "edusync"

index = pc.Index(INDEX_NAME)