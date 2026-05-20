from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import fitz
import random
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key="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")

pdf_text_store = {}

@app.get("/")
def home():
    return {"message": "Smart Study AI Backend Running"}

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
def ask_ai(question: str):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant for students. Answer clearly and concisely."},
                {"role": "user", "content": question}
            ]
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        pdf_text_store["current"] = text
        return {"message": "PDF uploaded successfully", "pages": doc.page_count}
    except Exception as e:
        return {"error": str(e)}

@app.get("/ask-pdf")
def ask_pdf(question: str):
    if "current" not in pdf_text_store:
        return {"answer": "No PDF uploaded yet. Please upload a PDF first."}
    try:
        context = pdf_text_store["current"][:3000]
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
def generate_quiz():
    if "current" not in pdf_text_store or not pdf_text_store["current"].strip():
        raise HTTPException(status_code=400, detail="No PDF uploaded yet. Please upload a PDF first.")
    try:
        context = pdf_text_store["current"][:3000]
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are a quiz generator. Generate exactly 5 MCQ questions based on the notes provided.
Return ONLY a JSON array, no extra text, in this exact format:
[
  {
    "question": "Question here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) option1"
  }
]"""},
                {"role": "user", "content": f"Generate quiz from these notes:\n{context}"}
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
def generate_flashcards():
    if "current" not in pdf_text_store or not pdf_text_store["current"].strip():
        raise HTTPException(status_code=400, detail="No PDF uploaded yet. Please upload a PDF first.")
    try:
        context = pdf_text_store["current"][:3000]
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