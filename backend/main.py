from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Response, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import cohere
import numpy as np
import fitz
import random
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, User, StudyPlan, QuizScore
from auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

pdf_store = {}  # {username: {"chunks": [], "embeddings": []}}

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart-study-ai-five.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Smart Study AI Backend Running"}

@app.api_route("/ping", methods=["GET", "HEAD"])
def ping():
    return {"status": "ok"}

@app.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(username=req.username, hashed_password=hash_password(req.password))
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/login")
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.username})
    refresh_token = create_refresh_token({"sub": user.username})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=1800
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=604800
    )
    return {"message": "Login successful", "username": user.username}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", samesite="none", secure=True)
    response.delete_cookie("refresh_token", samesite="none", secure=True)
    return {"message": "Logged out"}

@app.post("/refresh")
def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access_token = create_access_token({"sub": username})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=1800
    )
    return {"message": "Token refreshed", "username": username}

@app.get("/me")
def get_me(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": username}

@app.get("/study")
def study(topic: str):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a study planner AI. When given a topic, respond in this exact JSON format only, no extra text: {\"topic\": \"topic name\", \"difficulty\": \"Easy/Medium/Hard\", \"tasks\": [\"task1\", \"task2\", \"task3\", \"task4\", \"task5\"]}"},
                {"role": "user", "content": f"Create a study plan for: {topic}"}
            ]
        )
        text = response.choices[0].message.content
        plan = json.loads(text)
        return plan
    except Exception as e:
        return {
            "topic": topic,
            "difficulty": "Custom",
            "tasks": [f"Study {topic} basics", f"Practice {topic} problems", f"Revise {topic} concepts"]
        }

@app.get("/ask")
def ask_ai(question: str, model: str = "llama-3.3-70b-versatile"):
    allowed_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"]
    if model not in allowed_models:
        model = "llama-3.3-70b-versatile"
    try:
        response = groq_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful study assistant for students. Answer clearly and concisely."},
                {"role": "user", "content": question}
            ]
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}
        
@app.get("/generate-notes")
def generate_notes(topic: str):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are an expert study notes generator. Generate detailed, well-structured study notes for the given topic.
Return ONLY a JSON object in this exact format, no extra text:
{
  "topic": "topic name",
  "summary": "2-3 sentence overview",
  "sections": [
    {
      "heading": "Section Title",
      "points": ["point 1", "point 2", "point 3"]
    }
  ],
  "key_terms": ["term1: definition", "term2: definition"],
  "quick_facts": ["fact1", "fact2", "fact3"]
}
Generate at least 4 sections with 4-6 points each. Be detailed and educational."""},
                {"role": "user", "content": f"Generate comprehensive study notes for: {topic}"}
            ]
        )
        text = response.choices[0].message.content
        notes = json.loads(text)
        return notes
    except Exception as e:
        return {"error": str(e)}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), username: str = ""):
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()

        if not text.strip():
            return {"error": "PDF appears to be scanned or image-based. Please upload a text-based PDF."}

        chunk_size = 900
        overlap = 175
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap

        response = cohere_client.embed(
            texts=chunks,
            model="embed-english-v3.0",
            input_type="search_document"
        )
        embeddings = [np.array(e) for e in response.embeddings]

        pdf_store[username] = {"chunks": chunks, "embeddings": embeddings}

        return {"message": "PDF uploaded successfully", "pages": doc.page_count, "chunks": len(chunks)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/ask-pdf")
def ask_pdf(question: str, username: str = ""):
    user_store = pdf_store.get(username)
    if not user_store or not user_store["chunks"]:
        return {"answer": "No PDF uploaded yet. Please upload a PDF first."}
    try:
        q_response = cohere_client.embed(
            texts=[question],
            model="embed-english-v3.0",
            input_type="search_query"
        )
        q_embedding = np.array(q_response.embeddings[0])

        similarities = []
        for emb in user_store["embeddings"]:
            sim = np.dot(q_embedding, emb) / (np.linalg.norm(q_embedding) * np.linalg.norm(emb))
            similarities.append(sim)

        top_indices = np.argsort(similarities)[-3:][::-1]
        context = "\n\n".join([user_store["chunks"][i] for i in top_indices])

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a study assistant. Answer questions based only on the provided notes."},
                {"role": "user", "content": f"Notes:\n{context}\n\nQuestion: {question}"}
            ]
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}

@app.get("/generate-quiz")
def generate_quiz(username: str = "", difficulty: str = "Medium"):
    user_store = pdf_store.get(username)
    if not user_store or not user_store["chunks"]:
        raise HTTPException(status_code=400, detail="No PDF uploaded yet. Please upload a PDF first.")
    try:
        sample_chunks = random.sample(user_store["chunks"], min(6, len(user_store["chunks"])))
        context = " ".join(sample_chunks)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"""You are a quiz generator. Generate exactly 5 {difficulty} difficulty MCQ questions based on the notes provided.
Easy: simple recall questions. Medium: application questions. Hard: analysis and tricky questions.
Return ONLY a JSON array, no extra text, in this exact format:
[
  {{
    "question": "Question here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) option1"
  }}
]"""},
                {"role": "user", "content": f"Generate {difficulty} difficulty quiz from these notes:\n{context}"}
            ]
        )
        text = response.choices[0].message.content
        try:
            quiz = json.loads(text)
        except json.JSONDecodeError:
            return {
                "quiz": [{
                    "question": "Could not parse quiz. Please try again.",
                    "options": ["A) Try again", "B) Re-upload PDF", "C) Check notes", "D) Contact support"],
                    "answer": "A) Try again"
                }]
            }
        for item in quiz:
            correct = item["answer"]
            random.shuffle(item["options"])
            item["answer"] = correct
        return {"quiz": quiz}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}

@app.get("/generate-flashcards")
def generate_flashcards(username: str = ""):
    user_store = pdf_store.get(username)
    if not user_store or not user_store["chunks"]:
        raise HTTPException(status_code=400, detail="No PDF uploaded yet. Please upload a PDF first.")
    try:
        sample_chunks = random.sample(user_store["chunks"], min(6, len(user_store["chunks"])))
        context = " ".join(sample_chunks)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are a flashcard generator. Generate exactly 5 flashcards based on the notes provided.
Return ONLY a JSON array, no extra text, in this exact format:
[
  {
    "question": "Term or concept here?",
    "answer": "Clear concise answer here."
  }
]"""},
                {"role": "user", "content": f"Generate flashcards from these notes:\n{context}"}
            ]
        )
        text = response.choices[0].message.content
        try:
            flashcards = json.loads(text)
        except json.JSONDecodeError:
            return {
                "flashcards": [{
                    "question": "Could not parse flashcards.",
                    "answer": "Please try again."
                }]
            }
        return {"flashcards": flashcards}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}

@app.post("/save-study-plan")
def save_study_plan(username: str, topic: str, difficulty: str, tasks: str, db: Session = Depends(get_db)):
    plan = StudyPlan(username=username, topic=topic, difficulty=difficulty, tasks=tasks)
    db.add(plan)
    db.commit()
    return {"message": "Study plan saved"}

@app.post("/save-quiz-score")
def save_quiz_score(username: str, score: int, total: int, db: Session = Depends(get_db)):
    result = QuizScore(username=username, score=score, total=total)
    db.add(result)
    db.commit()
    return {"message": "Quiz score saved"}

@app.get("/dashboard")
def get_dashboard(username: str, db: Session = Depends(get_db)):
    plans = db.query(StudyPlan).filter(StudyPlan.username == username).order_by(StudyPlan.created_at.desc()).limit(10).all()
    scores = db.query(QuizScore).filter(QuizScore.username == username).order_by(QuizScore.created_at.desc()).limit(10).all()

    streak = 0
    today = datetime.utcnow().date()
    check_date = today
    all_dates = set(
        p.created_at.date()
        for p in db.query(StudyPlan).filter(StudyPlan.username == username).all()
    )
    while check_date in all_dates:
        streak += 1
        check_date -= timedelta(days=1)

    return {
        "study_plans": [{"topic": p.topic, "difficulty": p.difficulty, "tasks": p.tasks, "created_at": str(p.created_at)} for p in plans],
        "quiz_scores": [{"score": s.score, "total": s.total, "created_at": str(s.created_at)} for s in scores],
        "streak": streak
    }