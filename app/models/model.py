import os
import time
from dotenv import load_dotenv
from typing import List
from pydantic import SecretStr
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.embeddings import Embeddings  # Added base class!
from huggingface_hub import login

load_dotenv()

# 1. FIXED: Only login if the key actually exists in .env!
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API")
if HUGGINGFACE_API_KEY:
    login(HUGGINGFACE_API_KEY)

gemini_1 = os.getenv("GEMINI_1")
gemini_2 = os.getenv("GEMINI_2")
gemini_3 = os.getenv("GEMINI_3")


##<<----------------------------------------LLM MODELS-------------------------------------------------##

def chat_model(temperature=0.3):
    model1 = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=temperature,
        google_api_key=gemini_1,
    )

    model2 = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=temperature ,
        google_api_key=gemini_2
    )

    model3 = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=temperature ,
        google_api_key=gemini_3,
    )

    return model1.with_fallbacks([model2, model3])


##<<--------------------------------EMBEDDING MODEL------------------------------------------->>

# 2. FIXED: Changed to text-embedding-004 to support output_dimensionality=384
# 3. FIXED: Changed api_key to google_api_key
embedding1 = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", 
    google_api_key=gemini_1,
    output_dimensionality=384
)

embedding2 = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=gemini_2, 
    output_dimensionality=384
)

embedding3 = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=gemini_3,
    output_dimensionality=384
)

# 4. FIXED: Inherit from LangChain's Embeddings base class
class FallbackEmbeddings(Embeddings):
    def __init__(self, primary, fallbacks: List):
        self.all_models = [primary] + fallbacks
        self.batch_size = 16 

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        all_embeddings = []
        
        # Split the large list into smaller chunks
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i : i + self.batch_size]
            success = False
            
            # Try each model for THIS specific batch
            for model_idx, model in enumerate(self.all_models):
                try:
                    embeddings = model.embed_documents(batch)
                    all_embeddings.extend(embeddings)
                    success = True
                    break  # Move to the next batch of text
                except Exception as e:
                    print(f"Model {model_idx + 1} failed on batch {i//self.batch_size}. Error: {e}")
                    time.sleep(1) 
            
            if not success:
                raise Exception("All embedding models failed")
        
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        for i, model in enumerate(self.all_models):
            try:
                return model.embed_query(text)
            except Exception as e:
                print(f"Model {i+1} failed query. Error: {e}")
                if i == len(self.all_models) - 1:
                    raise e

# --- Implementation ---
def get_embedding_model():
    """Fallback functions for embeddings models"""
    return FallbackEmbeddings(
        primary=embedding1,
        fallbacks=[embedding2, embedding3]
    )