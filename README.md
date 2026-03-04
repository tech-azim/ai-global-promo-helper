# Kopi Kita CRM ☕
> Mini CRM + AI Global Promo Helper for Mimi's Coffee Shop

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Embedding:** Google Gemini `text-embedding-004`
- **LLM:** Groq `llama3-8b-8192`
- **Auth:** JWT via `jose` + bcryptjs
- **UI:** Tailwind CSS + custom design system

## Setup

### 1. Install dependencies
```bash
pnpm install
pnpm add @supabase/supabase-js groq-sdk @google/generative-ai bcryptjs jose lucide-react clsx tailwind-merge sonner
pnpm add @types/bcryptjs -D
```

### 2. Environment variables
Copy `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=         # from aistudio.google.com
GROQ_API_KEY=           # from console.groq.com
JWT_SECRET=kopi-kita-secret-2026
```

### 3. Database setup
Run `supabase-schema.sql` in your Supabase SQL Editor.

### 4. Seed data
Start the app, then call:
```bash
curl -X POST http://localhost:3000/api/seed
```
This generates embeddings for all seed customers and fixes the login password.

### 5. Run
```bash
pnpm dev
```

## Login
- Email: `mimi@kopikita.id`
- Password: `kopikita123`

## Features
- 🔐 **Login** — JWT-based authentication
- 👥 **Customers** — Add/edit/delete, search by name, filter by tags
- ✨ **Promo Ideas** — AI-generated weekly promo themes from customer data
- 📊 **Dashboard** — Stats, top interests, campaign overview
- 🤖 **AI Chatbot** — RAG-powered chat with customer data context