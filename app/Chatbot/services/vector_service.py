from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from core.pinecone_client import index
from models.model import get_embedding_model
import os

import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore

def create_vectorstore_from_files(file_paths: list[str], namespace: str, chunk_size: int = 1000):
    """
    Processes multiple PDF files, adds source metadata, and batches them into a Pinecone vector store.
    """
    all_documents = []

    for file_path in file_paths:
        if not os.path.exists(file_path):
            continue
            
        loader = PyPDFLoader(file_path)
        
        documents = loader.load()

       
        for doc in documents:
            doc.metadata["source_file"] = os.path.basename(file_path)

        all_documents.extend(documents)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(all_documents)

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=get_embedding_model(),
        namespace=namespace
    )

    vectorstore.add_documents(chunks)
        
    os.remove(file_path)

    return True