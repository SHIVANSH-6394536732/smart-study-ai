from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import fitz  # pymupdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key="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")

pdf_text_store = {}  # stores extracted PDF text in memory

@app.get("/")
def home():
    return {"message": "Smart Study AI Backend Running"}

@app.get("/study")
def study(topic: str):
    topic = topic.lower()
    plans = {
        "ai": {"difficulty": "Medium", "tasks": ["Revise BFS", "Revise DFS", "Solve 2 problems"]},
        "dbms": {"difficulty": "Easy", "tasks": ["Normalization", "SQL Queries", "Transactions"]},
        "react": {"difficulty": "Medium", "tasks": ["useState", "Props", "Components"]}
    }
    if topic in plans:
        return {"topic": topic, **plans[topic]}
    return {"topic": topic, "difficulty": "Custom", "tasks": [f"Study {topic} basics"]}

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
        context = pdf_text_store["current"][:3000]  # first 3000 chars to stay within token limit
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