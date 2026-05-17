from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key="AIzaSyCf8kZegLC6WNA4hPl_JF55J3iOc_ux7jU")

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
        prompt = f"You are a helpful study assistant for students. Answer this clearly and concisely: {question}"
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return {"answer": response.text}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}