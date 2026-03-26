# 🤖 RAG Assistant — Internal Document Q&A Chatbot

<div align="center">

![RAG Assistant Banner](https://img.shields.io/badge/RAG-Assistant-2563EB?style=for-the-badge&logo=openai&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A production-ready AI-powered chatbot that answers questions exclusively from your company's documents.**

[🌐 Live Demo](#) · [⚙️ Admin Dashboard](#) · [📖 API Docs](#)

> 🔗 **Live URL** : `https://your-app.vercel.app` ← *will be updated after deployment*
> 
> ⚙️ **Admin Panel** : `https://your-app.vercel.app/admin` ← *will be updated after deployment*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Admin Dashboard](#-admin-dashboard)
- [Deployment](#-deployment)
- [How RAG Works](#-how-rag-works)
- [Screenshots](#-screenshots)

---

## 🧠 Overview

**RAG Assistant** is a full-stack AI chatbot built on the **Retrieval-Augmented Generation (RAG)** pattern. Instead of relying on a general-purpose AI that might hallucinate, this system only answers questions based on documents you upload — making it ideal for internal company knowledge bases, HR policy Q&A, product documentation, and more.

Employees can ask natural language questions through the chat interface and receive accurate answers sourced directly from indexed company documents. Every answer includes citations showing exactly which document it came from.

> **"What is the remote work policy for international employees?"**
> 
> *The chatbot answers from your actual HR document — not from the internet.*

---

## ✨ Features

### 💬 Chat Interface
- Modern dark-themed chat UI with real-time streaming responses
- Source citations shown below every answer
- Full conversation history with session management
- Light/dark mode toggle
- Strict mode — refuses to answer questions outside the document scope

### 🗂️ Admin Dashboard
- **Document Management** — Upload, index, re-index, and delete documents
- **Supported formats** — PDF, DOCX, TXT, XLSX
- **Real-time indexing status** — Processing → Indexed → Failed
- **Chat Logs** — Monitor all user queries with response times and sources used
- **Users** — Overview of active users and query activity
- **Settings** — Configure RAG parameters (Top-K, similarity threshold, strict mode)
- **Danger Zone** — Clear vector database with confirmation

### 🔐 Authentication & Security
- Role-based access control via **Clerk**
- Admin-only dashboard (`role: "admin"` in Clerk metadata)
- API key protection on all backend admin endpoints
- Public chat interface accessible without login

### ⚙️ RAG Pipeline
- Automatic text extraction from PDF, DOCX, TXT, XLSX
- Chunking with configurable size and overlap
- HuggingFace embeddings (`all-MiniLM-L6-v2`)
- Vector similarity search via Qdrant
- Configurable Top-K retrieval and similarity threshold
- SSE (Server-Sent Events) for streaming responses

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **UI Components** | shadcn/ui + Lucide Icons |
| **State Management** | Zustand + localStorage persistence |
| **Authentication** | Clerk (RBAC with admin roles) |
| **Backend** | FastAPI + Python 3.11 + Uvicorn |
| **AI Orchestration** | LangChain >= 0.2.0 |
| **LLM** | Groq API (`llama-3.1-8b-instant`) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` |
| **Vector Database** | Qdrant (local Docker / Qdrant Cloud) |
| **Containerization** | Docker + Docker Compose |

---

## 🏗 Architecture

```
Browser
   │
   ▼
Next.js Frontend (Vercel / localhost:3000)
   │
   ├── /              → Chat UI (employees)
   └── /admin/*       → Admin Dashboard (admin only)
        │
        ▼ (API Routes proxy — avoids CORS)
FastAPI Backend (Render / localhost:8000)
   │
   ├── POST /chat          → RAG answer (non-streaming)
   ├── POST /chat/stream   → RAG answer (SSE streaming)
   ├── GET  /health        → Health check
   ├── GET/POST /admin/*   → Document & settings management
   │
   ▼
LangChain RAG Pipeline
   │
   ├── HuggingFace Embeddings (all-MiniLM-L6-v2)
   │
   ├── Qdrant Vector DB ← stores document chunks + embeddings
   │
   └── Groq LLM (llama-3.1-8b-instant) ← generates answers
```

### RAG Flow
```
User Query
    │
    ▼
Embed query → Search Qdrant (Top-K similar chunks)
    │
    ▼
Retrieved chunks + Strict system prompt → Groq LLM
    │
    ▼
Stream answer back to user + show source citations
```

---

## 📁 Project Structure

```
rag-chatbot/
│
├── backend/
│   ├── main.py              # FastAPI app, endpoints, middleware
│   ├── rag_chain.py         # LangChain RAG logic + LLM factory
│   ├── vector_store.py      # VectorStoreAdapter (Qdrant/Pinecone)
│   ├── ingest.py            # CLI data ingestion script
│   ├── documents.py         # Document management API router
│   ├── chat_logs.py         # Chat logging API router
│   └── settings.py          # RAG settings API router
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Chat home page
│   │   ├── layout.tsx                  # Root layout + providers
│   │   ├── globals.css                 # Tailwind + CSS variables
│   │   ├── sign-in/                    # Clerk sign-in page
│   │   ├── admin/                      # Admin dashboard pages
│   │   │   ├── page.tsx                # Overview
│   │   │   ├── documents/page.tsx      # Document management
│   │   │   ├── chat-logs/page.tsx      # Query history
│   │   │   ├── users/page.tsx          # User activity
│   │   │   └── settings/page.tsx       # System configuration
│   │   └── api/                        # Next.js API routes (proxy)
│   ├── components/
│   │   ├── chat/                       # Chat UI components
│   │   ├── sidebar/                    # Chat sidebar
│   │   └── admin/                      # Admin dashboard components
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat + SSE streaming logic
│   │   └── useHealthCheck.ts           # Backend health polling
│   └── store/
│       └── chatStore.ts                # Zustand global state
│
├── data/                               # Drop documents here to index
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docker-compose.yml
├── requirements.backend.txt
├── .env.example
└── .env.local.example
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js 20 LTS](https://nodejs.org/)
- [Python 3.11](https://www.python.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Groq API Key](https://console.groq.com) (free)
- A [Clerk Account](https://clerk.com) (free, up to 10k MAU)

---

## 🔑 Environment Variables

### Backend — `.env`

Copy `.env.example` to `.env` and fill in:

```env
# LLM Configuration
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-8b-instant

# Vector Database
VECTOR_DB=qdrant
QDRANT_HOST=localhost          # Use Qdrant Cloud URL for production
QDRANT_PORT=6333
QDRANT_COLLECTION_NAME=rag_docs
QDRANT_API_KEY=                # Only needed for Qdrant Cloud

# Backend Security
ADMIN_API_KEY=generate-a-random-string-here
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
APP_VERSION=1.0.0
```

### Frontend — `.env.local`

Copy `.env.local.example` to `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin

# Backend connection (server-side only)
BACKEND_URL=http://localhost:8000
ADMIN_API_KEY=same-key-as-backend
```

---

## 💻 Running Locally

### Option A — Docker (Recommended, one command)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/rag-chatbot.git
cd rag-chatbot

# 2. Create .env from example
copy .env.example .env
# Fill in GROQ_API_KEY and other values

# 3. Start all services
docker-compose up --build
```

Services will be available at:
| Service | URL |
|---|---|
| 💬 Chat UI | http://localhost:3000 |
| ⚙️ Admin Dashboard | http://localhost:3000/admin |
| 📄 API Docs | http://localhost:8000/docs |

### Option B — Local Development (3 terminals)

**Terminal 1 — Qdrant**
```bash
docker run -d --name qdrant-dev -p 6333:6333 qdrant/qdrant:latest
```

**Terminal 2 — Backend**
```bash
cd rag-chatbot
python -m venv .venv
.venv/Scripts/activate          # Windows
# source .venv/bin/activate     # Mac/Linux

pip install -r requirements.backend.txt
uvicorn backend.main:app --reload --port 8000
```

**Terminal 3 — Frontend**
```bash
cd rag-chatbot/frontend
npm install
npm run dev
```

### Indexing Your Documents

Drop your PDF, DOCX, TXT, or XLSX files into the `data/` folder, then run:

```bash
# With Docker
docker-compose exec backend python -m backend.ingest --data-dir /app/data

# Local dev
python -m backend.ingest --data-dir ./data
```

Wait for `upsert complete` in the logs — your chatbot is now ready to answer questions from those documents.

---

## 🗂 Admin Dashboard

Access the admin dashboard at `/admin`. You need a Clerk account with `role: "admin"` set in `publicMetadata`.

**Setting admin role in Clerk:**
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Users → select your user
3. Metadata → Public Metadata → add:
   ```json
   { "role": "admin" }
   ```

### Admin Features

| Page | Description |
|---|---|
| `/admin` | System overview, KPIs, service health |
| `/admin/documents` | Upload, index, delete documents |
| `/admin/chat-logs` | Monitor all user queries and responses |
| `/admin/users` | User activity overview |
| `/admin/settings` | Configure RAG parameters, danger zone |

---

## ☁️ Deployment

This app is deployed using **100% free tiers**:

| Service | Provider | Cost |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Free |
| Backend | [Render](https://render.com) | Free (spins down when idle) |
| Vector DB | [Qdrant Cloud](https://cloud.qdrant.io) | Free (1GB) |
| Auth | [Clerk](https://clerk.com) | Free (10k MAU) |
| LLM | [Groq](https://console.groq.com) | Free tier |

> ⚠️ **Note:** Render free tier spins down after 15 minutes of inactivity. First request after idle may take ~30 seconds to wake up. This is expected behavior for portfolio use.

### Deploy Steps

**1. Qdrant Cloud**
- Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
- Create a free cluster
- Copy the cluster URL and API key to your `.env`

**2. Render (Backend)**
- Connect your GitHub repo at [render.com](https://render.com)
- New Web Service → select repo
- Build: `pip install -r requirements.backend.txt`
- Start: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Add all environment variables from `.env`

**3. Vercel (Frontend)**
- Import repo at [vercel.com](https://vercel.com)
- Root directory: `frontend`
- Add all environment variables from `.env.local`
- Set `BACKEND_URL` to your Render service URL

---

## 🧪 How RAG Works

RAG (Retrieval-Augmented Generation) combines document search with AI generation:

```
1. INGEST PHASE (one-time setup)
   Documents → Extract text → Split into chunks
   → Embed chunks → Store in Qdrant vector DB

2. QUERY PHASE (every chat message)
   User query → Embed query → Search similar chunks in Qdrant
   → Top-K chunks retrieved → Sent to LLM with strict prompt
   → LLM generates answer ONLY from retrieved context
   → Answer + source citations returned to user
```

**Why RAG instead of fine-tuning?**
- No expensive GPU training required
- Documents can be updated without retraining
- Answers are traceable back to source documents
- Prevents hallucinations with strict system prompt

---

## 📸 Screenshots

> *Screenshots will be added after deployment*

| Chat Interface | Admin Dashboard | Document Management |
|---|---|---|
| ![Chat](placeholder) | ![Admin](placeholder) | ![Documents](placeholder) |

---

## 🤝 Contributing

This is a portfolio project. Feel free to fork and adapt for your own use case.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ using Next.js, FastAPI, LangChain, and Groq

⭐ Star this repo if you found it helpful!

</div>
