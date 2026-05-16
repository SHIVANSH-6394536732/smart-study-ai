from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS fix
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Smart Study AI Backend Running"}

@app.get("/hello")
def hello():
    return {"message": "Hello from FastAPI backend!"}

@app.get("/study")
def study(topic: str):
    return {"message": f"Let's study {topic} today!"}