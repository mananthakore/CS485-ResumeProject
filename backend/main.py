from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pipeline once at startup
generator = pipeline("text2text-generation", model="google/flan-t5-base")

class EnhanceRequest(BaseModel):
    bullet: str
    job_description: str

@app.post("/enhance")
async def enhance(req: EnhanceRequest):
    try:
        prompt = f"""
        Rewrite the following resume bullet to better match the job description.
        Use action verbs and quantify impact.

        Job Description:
        {req.job_description}

        Resume Bullet:
        {req.bullet}

        Improved Bullet:
        """
        output = generator(prompt, max_length=128, do_sample=True)
        return {"enhanced": output[0]['generated_text'].strip()}

    except Exception as e:
        return {"error": str(e)}
