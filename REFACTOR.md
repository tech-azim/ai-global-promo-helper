# ☕ Kopi Kita CRM — Refactor Roadmap

> *"Good code, like good coffee, is all about the right extraction."*

Architectural refactor & strategic tech debt documentation. This outlines the transition from our current MVP to a robust, scalable system.

← [Back to README](./README.md) · [AI Prompts](./AI_PROMPTS.md)

---

## 🏗️ 1. Core Tech Stack

### Database Layer: Migrate to Drizzle ORM

| | Detail |
|---|---|
| **Current** | Supabase Client (Raw SQL / RPC) |
| **Target** | Drizzle ORM |
| **Why** | Lighter cold starts vs Prisma. TypeScript-first with raw SQL performance — critical for `pgvector` similarity queries. |

### UI System: Migrate to Shadcn UI

| | Detail |
|---|---|
| **Current** | Ant Design + Tailwind CSS |
| **Target** | Shadcn UI |
| **Why** | Full ownership of component code. Enables consistent `#4B3621` (Coffee Brown) brand palette without library lock-in. |

---

## 🌊 2. Data & State Management

- **TanStack Query** — Replace manual `useEffect` fetching with automated caching and background refetching. Dashboard stats should never go stale.
- **Debounced Search** — Implement `useDebounce` on customer search to stop triggering an API call on every keystroke.
- **Optimistic UI** — Confirm Delete/Edit actions instantly without waiting for a server response.

---

## 🧩 3. Component Architecture

### Decompose `CustomersPage.tsx`

Currently `>300 lines`. Target split:
```
CustomersPage.tsx
├── CustomerSearch.tsx       # Search input & interest tag filters
├── CustomerGrid.tsx         # Customer card/list display
└── CustomerFormModal.tsx    # Add/edit form and validation
```

### Zod × Shadcn Form Validation

Enforce strict schema validation at the form layer to prevent corrupted or incomplete data from reaching Supabase.

---

## 🧠 4. AI & RAG Precision

Full prompt details and model specs → [AI_PROMPTS.md](./AI_PROMPTS.md)

### Unified Embedding Dimension (1536)

> ⚠️ **Non-negotiable:** All legacy 768-dimension embeddings must be deleted and re-generated.

Standardized on **1536 dimensions** via OpenRouter. The `match_customers` RPC uses cosine similarity with a threshold of `0.3`.

### Multi-Interest Filtering

Upgrade customer tag queries from single-tag matching to multi-tag using PostgreSQL's `.overlaps()` array operator.

### Server-side Pagination

Beyond **1,000+ customers**, replace full-load rendering with Infinite Scroll + server-side cursor pagination to keep the app performant.

---

## 🎨 5. UI / UX Polish

- **Tailwind Design System** — Extract all inline color values into `tailwind.config.ts`. The `#4B3621` Coffee Brown palette must be consistent across the Dashboard and Chatbot.
- **Empty States** — Replace blank screens with an interactive "How to Brew" onboarding guide for new users.

---

## 🚀 Goals

| Priority | Goal | Description |
|---|---|---|
| ☕ High | **Scalability** | Handle thousands of customers without performance degradation |
| 🧼 High | **Maintainability** | Modular, readable code any developer can work with |
| 🌿 Medium | **AI Accuracy** | Mimi gives sharper answers through clean, standardized embeddings |

---

## 💡 Engineering Note

> *"Top priority: **Unified Embedding** + **TanStack Query**. In an AI-driven CRM, data accuracy and fetch speed are the foundation. A clean brew starts with clean data."*