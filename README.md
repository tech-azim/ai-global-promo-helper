# Kopi Kita CRM ☕
> Mini CRM + AI Promo Helper for Mimi's Coffee Shop — powered by RAG, vector search, and Groq LLM.

📄 **Docs:** [Refactor Roadmap](./REFACTOR.md) · [AI Prompts](./AI_PROMPTS.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **LLM** | Groq — `llama-3.3-70b-versatile` |
| **Embeddings** | OpenRouter (1536 dimensions) |
| **Auth** | JWT via `jose` + bcryptjs |
| **UI** | Ant Design + Tailwind CSS |

---

## Setup

### 1. Install dependencies
```bash
pnpm install
pnpm add @supabase/supabase-js groq-sdk cohere-ai bcryptjs jose lucide-react clsx tailwind-merge sonner
pnpm add @types/bcryptjs -D
```

### 2. Environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=           # console.groq.com
OPENROUTER_API_KEY=     # openrouter.ai
COHERE_API_KEY=         # dashboard.cohere.com (for reranking)
JWT_SECRET=kopi-kita-secret-2026
```

### 3. Database setup
Run `supabase-schema.sql` in your Supabase SQL Editor.

### 4. Seed data
```bash
pnpm dev
curl -X POST http://localhost:3000/api/seed
```
Generates 1536-dim embeddings for all seed customers and fixes the login password.

### 5. Run
```bash
pnpm dev
```

---

## Login

| Field | Value |
|---|---|
| Email | `mimi@kopikita.id` |
| Password | `kopikita123` |

---

## Features

- 🔐 **Auth** — JWT-based login
- 👥 **Customers** — Add/edit/delete, search by name, filter by interest tags
- ✨ **Promo Ideas** — 3 AI-generated weekly promo themes based on customer interest data
- 📊 **Dashboard** — Stats, top interests, campaign overview
- 🤖 **Mimi Chatbot** — RAG-powered chat with vector search, keyword fallback, and Cohere reranking

---

## Project Docs

| File | Description |
|---|---|
| [REFACTOR.md](./REFACTOR.md) | Architectural roadmap & tech debt plan |
| [AI_PROMPTS.md](./AI_PROMPTS.md) | All AI prompts, models, and RAG strategy |