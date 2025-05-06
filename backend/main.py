# === File: backend/main.py ===
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RewriteRequest(BaseModel):
    bullet: str
    style: str

class GenerateRequest(BaseModel):
    role: str
    responsibility: str
    tech: str = ""

model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")

@app.post("/rewrite")
async def rewrite_bullet(data: RewriteRequest):
    prompt = f"Rewrite this resume bullet to be more {data.style}:\n'{data.bullet}'"
    response = model.generate_content(prompt)
    return {"rewritten": response.text.strip()}

@app.post("/generate")
async def generate_bullet(data: GenerateRequest):
    prompt = (
        f"Write a professional resume bullet point for a {data.role} who {data.responsibility}"
        f"{' using ' + data.tech if data.tech else ''}."
    )
    response = model.generate_content(prompt)
    return {"generated": response.text.strip()}
