# === File: backend/main.py ===
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

class AtsScoreRequest(BaseModel):
    bullet: str
    job_description: str
    
model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")

@app.post("/rewrite")
async def rewrite_bullet(data: RewriteRequest):
    prompt = f"Rewrite this resume bullet to be more {data.style}:\n'{data.bullet}'"
    response = model.generate_content(prompt)
    return {"rewritten": response.text.strip()}

@app.post("/ats_score")
async def calculate_ats_score(data: AtsScoreRequest):
    texts = [data.bullet, data.job_description]
    vectorizer = TfidfVectorizer().fit_transform(texts)
    vectors = vectorizer.toarray()
    score = cosine_similarity([vectors[0]], [vectors[1]])[0][0]
    return {"ats_score": round(score * 100, 2)}
