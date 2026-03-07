import asyncio
from llama_cloud import AsyncLlamaCloud
import os
from dotenv import load_dotenv
import time
import asyncpg
import urllib.request
import io
import json
from models.model import chat_model


load_dotenv()
LLAMA_API_KEY=os.getenv("LLAMA_CLOUD_API_KEY")
AGENT_ID = os.getenv("LLAMA_EXTRACT_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")

print(f"DEBUG: Has Access Key? {bool(AWS_ACCESS_KEY)}")
async def run_master_pipeline():
    # 1. Connect using the Database URL
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # 2. Automatically find all unique subjects in your source table
        subject_records = await conn.fetch("SELECT DISTINCT subject FROM pyq_papers WHERE subject IS NOT NULL")
        subjects = [r['subject'] for r in subject_records]

        print(f"Found subjects: {subjects}")

        for subject in subjects:
            print(f"\n--- Starting Pipeline for: {subject} ---")
            await run_full_pipeline(conn, subject)

    finally:
        # Close connection only once at the very end
        await conn.close()

async def run_full_pipeline(conn, subject_name):
    llama_client = AsyncLlamaCloud(api_key=LLAMA_API_KEY)
    
    # --- 1. EXTRACTION PHASE ---
    records = await conn.fetch("SELECT id, file_url FROM pyq_papers WHERE subject = $1", subject_name)

    for rec in records:
        exists = await conn.fetchval("SELECT 1 FROM extracted_exam_data WHERE document_id = $1", rec['id'])
        if exists: continue

        file_url = rec['file_url']
        print(f"DEBUG: Downloading file from {file_url}")

        # Cloudinary Direct Download
        req = urllib.request.Request(file_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            file_bytes = response.read()

        filename = file_url.split('/')[-1]

        # LlamaCloud Extraction
        print(f"DEBUG: Extracting data from {filename}...")
        llama_file = await llama_client.files.create(
            file=(filename, io.BytesIO(file_bytes)), 
            purpose="extract"
        )
        
        result = await llama_client.extraction.jobs.extract(
            extraction_agent_id=AGENT_ID, 
            file_id=llama_file.id
        )

        # Robust Data Parsing
        raw_data = result.data
        if isinstance(raw_data, str):
            try:
                clean_str = raw_data.strip().removeprefix("```json").removesuffix("```").strip()
                raw_data = json.loads(clean_str)
            except Exception:
                continue

        if isinstance(raw_data, dict):
            list_values = [v for v in raw_data.values() if isinstance(v, list)]
            raw_data = list_values[0] if list_values else [raw_data]

        # FIX 1: Only insert columns that exist in your ExtractedExamData model
        rows_to_save = []
        for r in raw_data:
            try:
                topic = r.get('topic') or r.get('Name') or 'Unknown Topic'
                marks = r.get('marks') or r.get('total_marks') or 0
                frequency = r.get('frequency', 1)

                rows_to_save.append((rec['id'], topic, marks, frequency))
            except AttributeError:
                pass

        await conn.executemany(
            "INSERT INTO extracted_exam_data (document_id, topic, marks, frequency) VALUES ($1,$2,$3,$4)", 
            rows_to_save
        )
        print(f"DEBUG: Successfully saved {len(rows_to_save)} topics to the database.")


    # --- 2. ANALYSIS PHASE ---
    # FIX 2: Use a JOIN to get the subject from the pyq_papers table
    all_raw_data = await conn.fetch("""
        SELECT e.topic, e.marks 
        FROM extracted_exam_data e
        JOIN pyq_papers p ON e.document_id = p.id
        WHERE p.subject = $1
    """, subject_name)
    
    if not all_raw_data:
        return

    data_string = "\n".join([f"- {r['topic']} ({r['marks']} marks)" for r in all_raw_data])

    analysis_prompt = f"""
    Analyze these topics for {subject_name}. 
    1. Group similar names (e.g. 'Binary Tree' and 'Trees' -> 'Binary Trees').
    2. Sum marks and count frequency.
    3. Categorize priority: 'High' (freq > 3), 'Medium', or 'Low'.
    Return JSON only: [{{"topic": "Name", "marks": 20, "freq": 5, "priority": "High"}}]
    DATA:
    {data_string}
    """

    print(f"DEBUG: Sending {len(all_raw_data)} raw topics to LLM for final aggregation...")
    
    # Initialize the Gemini model
    model = chat_model()
    
    # Generate the response asynchronously
    ai_response = await model.ainvoke(analysis_prompt) 
    
    # Extract and Load JSON from Gemini's response
    content = ai_response.content
    cleaned_json = content[content.find("["):content.rfind("]")+1]
    final_topics = json.loads(cleaned_json)

    # --- 3. UPSERT PHASE ---
    for item in final_topics:
        # This perfectly matches your TopicImportance model!
        await conn.execute("""
            INSERT INTO topic_importance (topic_name, subject, total_marks_contribution, appearance_count, priority_level)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (topic_name) DO UPDATE SET
                total_marks_contribution = EXCLUDED.total_marks_contribution,
                appearance_count = EXCLUDED.appearance_count,
                priority_level = EXCLUDED.priority_level,
                last_updated = CURRENT_TIMESTAMP
        """, item['topic'], subject_name, item['marks'], item['freq'], item['priority'])

    print(f"Analysis complete for {subject_name}. topic_importance table updated!")



    # --- EXECUTION BLOCK ---
if __name__ == "__main__":
    try:
        asyncio.run(run_master_pipeline())
    except Exception as e:
        print(f"An error occurred: {e}")