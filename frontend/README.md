# 🎓 Smart Study AI

> **The problem:** Students waste hours switching between tools — YouTube for learning, Notion for notes, Anki for flashcards, Google Forms for quizzes. Smart Study AI replaces all of them in one AI-powered platform.

🔗 **Live Demo:** https://smart-study-ai-five.vercel.app
💻 **GitHub:** https://github.com/SHIVANSH-6394536732/smart-study-ai

---

## 🎯 Problem Statement

Every student faces the same cycle:
1. Find a topic to study
2. Search YouTube for tutorials
3. Take notes manually
4. Make flashcards on Anki
5. Find practice questions online
6. Track progress somewhere

**Smart Study AI collapses this entire workflow into one platform.** Upload your lecture notes once — get quizzes, flashcards, AI answers, study plans, and structured notes instantly.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 Ask AI | Multi-model Q&A (Smart/Fast/Reasoning) with voice input + output |
| 📚 Study Plan Generator | AI study plans with YouTube reference links + PDF download |
| 📝 AI Notes Generator | Detailed bullet-point notes with PDF download + copy |
| 📄 PDF RAG Q&A | Upload lecture notes, get answers grounded in your content |
| 🧠 Quiz Generator | MCQs with Easy/Medium/Hard difficulty, timer, scoring, PDF export |
| 🃏 Flashcard Generator | 3D flip animation, PDF export |
| 📊 Dashboard | Study history, quiz scores, performance chart, streak tracker |
| 🍅 Pomodoro Timer | Focus session timer with break reminders |
| 🌙 Dark/Light Mode | Persists across sessions |
| 📱 Mobile Ready | Fully responsive on all screen sizes |

---

## 🏗️ Architecture

React (Vercel)

↓ HTTPS

FastAPI (Render) — Rate Limited, JWT Authenticated

↓

PostgreSQL (Neon) — User data, study plans, quiz scores
RAG Pipeline:

PDF Upload → PyMuPDF Extraction → 900-char Chunking (175 overlap)

→ Cohere Batch Embeddings → Per-user NumPy Vector Store

Question  → Cohere Query Embedding → Cosine Similarity Search

→ Top-3 Chunk Retrieval → Groq LLM → Grounded Answer

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React, Framer Motion, Recharts, jsPDF | Fast, animated, export-ready |
| Backend | FastAPI, Python, SlowAPI | Async, fast, production-ready |
| Database | PostgreSQL (Neon) + SQLAlchemy | Persistent, relational, free tier |
| AI / LLM | Groq (llama-3.3-70b, llama-3.1-8b, qwen3-32b) | Fastest inference available |
| Embeddings | Cohere embed-english-v3.0 | State-of-art semantic search |
| PDF Processing | PyMuPDF | Fast, reliable text extraction |
| Auth | JWT httpOnly cookies + bcrypt | Secure, industry standard |
| Monitoring | UptimeRobot | Keeps free tier backend alive |
| Deployment | Vercel + Render | Zero-cost, production-grade |

---

## 🔐 Security

- JWT authentication with httpOnly + secure + samesite=none cookies
- bcrypt password hashing with salt rounds
- Rate limiting on all AI endpoints (SlowAPI)
- Prompt injection guard — blocks jailbreak attempts
- Input sanitization with length limits
- File type + size validation (PDF only, max 10MB)
- CORS restricted to frontend domain only
- No fallback JWT secret — fails loudly if misconfigured
- Per-user PDF isolation — no data leakage between sessions

---

## 🔍 RAG Pipeline — How It Works

1. User uploads PDF
2. PyMuPDF extracts raw text
3. Text split into 900-char chunks with 175-char overlap
(overlap preserves context at chunk boundaries)
4. All chunks sent to Cohere embed-english-v3.0 in one batch call
5. Embeddings stored as NumPy arrays, keyed by username
6. User asks a question
7. Question embedded with Cohere (search_query input type)
8. Cosine similarity computed against all stored chunk embeddings
9. Top-3 most relevant chunks retrieved
10. Chunks + question sent to Groq LLM as context
11. LLM answers strictly based on provided context

> **Interview answer:** "I implemented a RAG pipeline using document chunking with overlap, Cohere vector embeddings, cosine similarity retrieval, and context-grounded LLM generation. PDF stores are isolated per authenticated user to prevent data leakage."

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key — [console.groq.com](https://console.groq.com) (free)
- Cohere API key — [dashboard.cohere.com](https://dashboard.cohere.com) (free)
- PostgreSQL — [Neon](https://neon.tech) free tier recommended

### Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file
GROQ_API_KEY=your_groq_key
COHERE_API_KEY=your_cohere_key
DATABASE_URL=your_postgresql_url
SECRET_KEY=your_random_secret_key

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:8000

npm start
```

---

## 📁 Project Structure

smart-study-ai/

├── backend/

│   ├── main.py          # FastAPI routes, RAG logic, rate limiting

│   ├── database.py      # SQLAlchemy models (User, StudyPlan, QuizScore)

│   ├── auth.py          # JWT authentication, bcrypt hashing

│   └── requirements.txt

└── frontend/

└── src/

├── components/  # AskAI, Quiz, Flashcard, PDF, Notes, StudyPlan

├── pages/       # Home, Notes, Dashboard, Login, NotFound

└── services/

└── api.js   # API layer with cold-start detection

---

## 🔑 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `COHERE_API_KEY` | Cohere API key for embeddings |
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (required, no fallback) |

### Frontend
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend base URL |

---

## 📊 What Makes This Different

| Feature | Smart Study AI | Notion | Anki | ChatGPT |
|---|---|---|---|---|
| RAG from your notes | ✅ | ❌ | ❌ | ❌ |
| Auto quiz generation | ✅ | ❌ | ❌ | ⚠️ Manual |
| Flashcards from PDF | ✅ | ❌ | ❌ | ⚠️ Manual |
| Study streak tracking | ✅ | ❌ | ✅ | ❌ |
| Voice Q&A | ✅ | ❌ | ❌ | ✅ |
| Free & open source | ✅ | ❌ | ✅ | ❌ |

---

## 👤 Author

**Shivansh Tripathi** — 3rd year CSE Student  
📧 Open to internship opportunities  
🔗 GitHub: [@SHIVANSH-6394536732](https://github.com/SHIVANSH-6394536732)  
🌐 Live: [smart-study-ai-five.vercel.app](https://smart-study-ai-five.vercel.app)

---

*Built with ❤️ as a full-stack AI portfolio project — from RAG pipeline to production deployment.*
