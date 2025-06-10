from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form
from typing import List
from database import database, metadata, engine
from models import applications
from schemas import Application, ApplicationIn
from dotenv import load_dotenv
from utils import extract_text_from_pdf, extract_text_from_docx, extract_from_any
from openai import OpenAI
import os
import json
import re


load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
metadata.create_all(engine)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/")
async def root():
    return {"message": "Job Tracker API is running!"}

@app.get("/applications", response_model=List[Application])
async def get_applications():
    query = applications.select()
    return await database.fetch_all(query)

@app.post("/applications", response_model=Application)
async def create_application(app_data: ApplicationIn):
    query = applications.insert().values(**app_data.dict())
    last_id = await database.execute(query)
    return {**app_data.dict(), "id": last_id}

@app.put("/applications/{app_id}", response_model=Application)
async def update_application(app_id: int, app_data: ApplicationIn):
    query = applications.update().where(applications.c.id == app_id).values(**app_data.dict())
    await database.execute(query)
    return {**app_data.dict(), "id": app_id}

@app.delete("/applications/{app_id}")
async def delete_application(app_id: int):
    query = applications.delete().where(applications.c.id == app_id)
    await database.execute(query)
    return {"message": f"Application with id {app_id} deleted"}

@app.post("/match/")
async def match_resume_to_job(resume: UploadFile = File(...), job_desc: UploadFile = File(...)):
    resume_bytes = await resume.read()
    job_bytes = await job_desc.read()

    if resume.filename.endswith(".pdf"):
        resume_text = extract_text_from_pdf(resume_bytes)
    elif resume.filename.endswith(".docx"):
        resume_text = extract_text_from_docx(resume_bytes)
    else:
        resume_text = resume_bytes.decode("utf-8")

    if job_desc.filename.endswith(".pdf"):
        job_text = extract_text_from_pdf(job_bytes)
    elif job_desc.filename.endswith(".docx"):
        job_text = extract_text_from_docx(job_bytes)
    else:
        job_text = job_bytes.decode("utf-8")

    prompt = f"""
Compare the following resume and job description and return:

1. A short match percentage and reasoning (2–3 sentences)
2. A short list of top matched skills (plain bullet points)
3. Top missing or weak areas (plain bullet points)
4. 2–3 specific suggestions to improve the resume
5. Return a JSON list of actual suggested changes: `old` → `new` strings

Resume:
{resume_text}

Job Description:
{job_text}
"""

    response = client.chat.completions.create(
        model="deepseek/deepseek-r1-0528:free",
        messages=[{"role": "user", "content": prompt}]
    )

    full_output = response.choices[0].message.content

    json_block = re.search(r"```json\s*(\[\s*{.*?}\s*])\s*```", full_output, re.DOTALL)

    if not json_block:
        print("No JSON block found in GPT output")
        suggestions = []
    else:
        try:
            suggestions = json.loads(json_block.group(1))
        except Exception as e:
            print("JSON parsing failed:", e)
            suggestions = []

    return {
        "result": full_output.split("```json")[0].strip(),
        "resume_text": resume_text,
        "suggestions": suggestions
    }



@app.post("/generate-cover-letter/")
async def generate_cover_letter(
    resume: UploadFile = File(...),
    job_desc: UploadFile = File(...),
    existing_letter_text: str = Form(None),
    existing_letter_file: UploadFile = File(None)

):
    resume_bytes = await resume.read()
    job_bytes = await job_desc.read()

    # Extract resume text
    if resume.filename.endswith(".pdf"):
        resume_text = extract_text_from_pdf(resume_bytes)
    elif resume.filename.endswith(".docx"):
        resume_text = extract_text_from_docx(resume_bytes)
    else:
        resume_text = resume_bytes.decode("utf-8")

    # Extract job text
    if job_desc.filename.endswith(".pdf"):
        job_text = extract_text_from_pdf(job_bytes)
    elif job_desc.filename.endswith(".docx"):
        job_text = extract_text_from_docx(job_bytes)
    else:
        job_text = job_bytes.decode("utf-8")

    # Cover letter text (prefer file over text box)
    letter_text = ""
    if existing_letter_file:
        letter_bytes = await existing_letter_file.read()
        letter_text = extract_from_any(existing_letter_file.filename, letter_bytes)
    elif existing_letter_text:
        letter_text = existing_letter_text
    else:
        letter_text = "[No existing letter provided]"

    prompt = f"""
You are an AI writing assistant. Improve the following cover letter based on the resume and job description below.

Resume:
{resume_text}

Job Description:
{job_text}

Existing Cover Letter:
{letter_text}

Instructions:
- Keep the tone professional and concise.
- Highlight matching skills.
- If no existing letter is provided, write a new one.
- Use plain text, no markdown.
- The output should only be the cover letter. No unneccessary texts.
"""


    response = client.chat.completions.create(
        model = "deepseek/deepseek-r1-0528:free",
        messages=[{"role": "user", "content": prompt}]
    )
    print("🧠 GPT RAW OUTPUT:")
    print(full_output)


    return {"cover_letter": response.choices[0].message.content}
