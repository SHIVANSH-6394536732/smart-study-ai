# 🎓 Smart Study AI

An AI-powered study platform for students. Upload your notes, generate study plans, take quizzes, and ask questions — all powered by RAG and LLMs.

🔗 **Live Demo:** https://smart-study-ai-five.vercel.app

---

## ✨ Features

- **AI Study Plan Generator** — Enter any topic, get a structured study plan with difficulty rating
- **Ask AI** — General study Q&A powered by Groq LLM
- **PDF Upload + RAG Q&A** — Upload lecture notes, ask questions answered from relevant chunks
- **Quiz Generator** — Auto-generate 5 MCQs from your uploaded PDF
- **Flashcard Generator** — Generate flashcards with 3D flip animation
- **User Dashboard** — View your study plan history and quiz scores
- **Drag & Drop Upload** — Intuitive PDF upload experience

---

## 🏗️ Architecture

```
React (Vercel)
      ↓
FastAPI (Render)
      ↓
PostgreSQL (Neon)

PDF Upload → Chunking → Cohere Embeddings → Vector Store
Question → Embedding → Cosine Similarity → Top-3 Chunks → Groq LLM → Answer
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, React Toastify |
| Backend | FastAPI, Python |
| Database | PostgreSQL (Neon) + SQLAlchemy |
| AI / LLM | Groq (llama-3.3-70b-versatile) |
| Embeddings | Cohere embed-english-v3.0 |
| PDF Processing | PyMuPDF |
| Auth | JWT (httpOnly cookies) |
| Deployment | Vercel + Render |

---

## 🔍 RAG Pipeline

1. PDF text extracted via PyMuPDF
2. Text chunked into 900-char segments with 175-char overlap
3. All chunks embedded in one batch API call via Cohere
4. Embeddings stored in memory as NumPy arrays
5. On question → question embedded → cosine similarity computed → top-3 chunks retrieved
6. Retrieved chunks passed as context to Groq LLM

> **Interview answer:** "I implemented a RAG pipeline using document chunking, Cohere vector embeddings, cosine similarity search, and LLM-based answer generation grounded on retrieved context."

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)
- Cohere API key (free at dashboard.cohere.com)
- PostgreSQL database (Neon free tier recommended)

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env file:
# GROQ_API_KEY=your_key
# SECRET_KEY=your_secret
# DATABASE_URL=your_postgresql_url
# COHERE_API_KEY=your_key
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
# Create .env file:
# REACT_APP_API_URL=http://localhost:8000
npm start
```

---

## 📁 Project Structure

```
smart-study-ai/
  backend/
    main.py          # FastAPI routes + RAG logic
    database.py      # SQLAlchemy models
    auth.py          # JWT authentication
    requirements.txt
  frontend/
    src/
      components/    # Reusable UI components
      pages/         # Home, Notes, Dashboard, Login
      services/
        api.js       # API layer
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for LLM |
| `COHERE_API_KEY` | Cohere API key for embeddings |
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT secret key |
| `REACT_APP_API_URL` | Backend URL for frontend |

---

## 👤 Author

**Shivansh** — 3rd year CSE student  
GitHub: [@SHIVANSH-6394536732](https://github.com/SHIVANSH-6394536732)