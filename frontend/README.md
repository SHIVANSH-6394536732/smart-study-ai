# 🎓 Smart Study AI

An AI-powered study platform built with React + FastAPI + Groq.

## Features
- AI Study Plan Generator
- Ask AI any study question
- PDF Upload + Q&A from notes
- Quiz Generator from notes
- Flashcard Generator with flip animation

## Tech Stack
- Frontend: React, React Router
- Backend: FastAPI, Python
- AI: Groq (llama-3.3-70b-versatile)
- PDF: PyMuPDF

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Project Structure
```
smart-study-ai/
  backend/
    main.py
  frontend/
    src/
      components/
      pages/
      services/
        api.js
```