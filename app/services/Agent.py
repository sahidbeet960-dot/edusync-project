import asyncio
from pydantic import BaseModel, Field
from llama_cloud import AsyncLlamaCloud
from dotenv import load_dotenv
import os
from typing import List

load_dotenv()
LLAMA_API_KEY=os.getenv("LLAMA_CLOUD_API_KEY")

class Question(BaseModel):
    topic: str = Field(description="Name of the topic")
    marks: int = Field(description="Marks associated with the topic")
    frequency:int =Field(description="The number of times the topic appeared in the PYQs")


class QuestionList(BaseModel):
    questions: List[Question]

async def main():

    client = AsyncLlamaCloud(api_key=LLAMA_API_KEY)

    agent = await client.extraction.extraction_agents.create(
        name="pyq-parser-12",
        data_schema=QuestionList.model_json_schema(),
        config={}
    )
    
    print(agent.id)


asyncio.run(main())