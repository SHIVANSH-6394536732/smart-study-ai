from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (React) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home route
@app.get("/")
def home():
    return {"message": "Smart Study AI Backend Running"}

# Test route
@app.get("/hello")
def hello():
    return {"message": "Hello from FastAPI backend!"}

# Dynamic study route
@app.get("/study")
def study(topic: str):
    topic = topic.lower()

    plans = {
        "ai": {
            "difficulty": "Medium",
            "tasks": ["Revise BFS", "Revise DFS", "Solve 2 problems"]
        },
        "dbms": {
            "difficulty": "Easy",
            "tasks": ["Normalization", "SQL Queries", "Transactions"]
        },
        "react": {
            "difficulty": "Medium",
            "tasks": ["useState", "Props", "Components"]
        }
    }

    if topic in plans:
        return {
            "topic": topic,
            **plans[topic]
        }

    return {
        "topic": topic,
        "difficulty": "Custom",
        "tasks": [f"Study {topic} basics"]
    }
    

@app.get("/ask")
def ask_ai(question: str):
    question = question.lower()

    if "dbms" in question:
        return {"answer": "DBMS normalization reduces data redundancy and improves consistency."}

    elif "react" in question:
        return {"answer": "React uses components to build reusable UI."}

    elif "ai" in question:
        return {"answer": "AI enables machines to simulate human intelligence."}

    return {"answer": f"I understand your question about: {question}"}