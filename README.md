# Pharmaceutical Customer Complaint & AI QA Risk Module 🚀

An end-to-end, AI-powered Quality Management System (QMS) module designed for pharmaceutical Active Pharmaceutical Ingredients (API) & Finished Dosage Forms (FDF). Powered by **FastAPI**, **LangGraph**, **Groq AI**, **React + Vite**, and **Redux Toolkit**.

---

## ✨ Features

- **🤖 LangGraph AI Copilot (AIVOA Copilot)**:
  - Automates PDF, EML, DOCX, and text complaint extraction.
  - Generates initial QA risk assessments, severity classification, root cause analysis recommendations, and CAPA action plans.
  - Detects narrative vs table document discrepancies (e.g. batch code discrepancies like `MFH260712A` vs `MFH2607124`).

- **📊 Audited QMS Ledger**:
  - Full database storage for committed pharmaceutical complaints.
  - Real-time status updates (*New*, *Under Investigation*, *CAPA Assigned*, *Closed*).
  - Multi-field natural language search across customers, products, batch codes, categories, dates, and risk notes.

- **📅 Date Tracking & Persistence**:
  - Dedicated **Date of Complaint** tracking to monitor complaint age.
  - Browser `localStorage` persistence ensuring form inputs and chat history survive tab switches and laptop sleep mode without losing data.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, LangGraph, SQLAlchemy, Groq SDK, PyPDF, Uvicorn
- **Frontend**: React 18, Vite, Redux Toolkit, TailwindCSS, Lucide React Icons, Axios

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate environment (.venv\Scripts\activate on Windows)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://127.0.0.1:5173`
- **Backend API Docs (Swagger)**: `http://127.0.0.1:8000/docs`
