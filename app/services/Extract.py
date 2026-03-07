import asyncio
from llama_cloud import AsyncLlamaCloud
import os
from dotenv import load_dotenv
import time

load_dotenv()
LLAMA_API_KEY=os.getenv("LLAMA_CLOUD_API_KEY")
AGENT_ID = os.getenv("LLAMA_EXTRACT_KEY")

async def analyse():

    client = AsyncLlamaCloud(api_key=LLAMA_API_KEY)

    # upload file
    with open("../data/2025.pdf", "rb") as f:
        file_obj = await client.files.create(file=f, purpose="extract")

    result = await client.extraction.jobs.extract(
        extraction_agent_id=AGENT_ID,
        file_id=file_obj.id
    )

    print(result.data)

start=time.time()

asyncio.run(analyse())
end=time.time()

print(f"Time:{start-end}")