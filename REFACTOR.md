# ☕ Kopi Kita CRM: The Perfect Brew Roadmap

### Architectural Refactor & Strategic Tech Debt Documentation

> *"Good code, like good coffee, is all about the right extraction."*

This document outlines the transition from our current MVP to a robust, enterprise-grade system. We are moving from a "quick morning shot" to a full-bodied, scalable architecture.

---

## 🏗️ 1. Upgrading the Roastery (Core Tech Stack)

We aren't just brewing — we are selecting the best beans for long-term sustainability.

### Database Layer: Migrating to Drizzle ORM

| | Detail |
|---|---|
| **Current State** | Supabase Client (Raw SQL/RPC) |
| **The Refactor** | Drizzle ORM |
| **Rationale** | Think of this as a "Light Roast." Drizzle is significantly lighter on Serverless cold starts compared to Prisma. It provides a TypeScript-first approach while maintaining raw SQL performance — essential for high-speed `pgvector` similarity searches. |

### UI System: Transition to Shadcn UI

| | Detail |
|---|---|
| **Current State** | Tailwind CSS + Custom Design System |
| **The Refactor** | Shadcn UI |
| **Rationale** | To ensure our "Latte Art" (UI) is consistent. Shadcn gives us full ownership of the component code, allowing us to customize our *Coffee Browns* brand identity without library constraints. |

---

## 🌊 2. Refining the Pour (Data & State Management)

Ensuring the data flow from server to user's cup is smooth and clog-free.

- **TanStack Query (React Query) Integration** — Moving away from manual `useEffect` fetching. Automated caching and background refetching ensure Dashboard stats never go stale.
- **Debounced Search (The Filter)** — Preventing "over-extraction." Currently, every keystroke in the Customers search triggers an API call. Implementing `useDebounce` will save server resources and API tokens.
- **Optimistic UI for Baristas** — Users shouldn't wait for a server response; the UI will optimistically confirm Delete/Edit actions to make the CRM feel instant.

---

## 🧩 3. Grinding the Beans (Component Architecture)

Breaking down bitter "Mega Components" into sweet, manageable pieces.

### Decomposition of `CustomersPage.tsx`

Currently this file is too concentrated (`>300 lines`). It will be split into:
```
CustomersPage.tsx
├── CustomerSearch.tsx       # Focused on flavor filters (Search & Interests)
├── CustomerGrid.tsx         # Clean data presentation
└── CustomerFormModal.tsx    # Isolated input logic
```

### Zod × Shadcn Form Validation

Strict schema validation to ensure no "raw" or corrupted data enters our database.

---

## 🧠 4. The Secret Recipe: AI & RAG Precision

The core intelligence behind **Mimi**, our AI Chatbot.

### Unified Embedding Standard (1536 Dimensions)

> ⚠️ **Non-negotiable:** All legacy 768-dimension embeddings must be removed.

Standardizing on **1536 dimensions** (`text-embedding-3-small`) is required for sharp, accurate RAG responses.

### Multi-Interest Filtering (`.overlaps()`)

Upgrading our query from "searching for one flavor" to "searching for complex flavor profiles" using efficient PostgreSQL array operators.

### Server-side Pagination

As our data grows to **1,000+ customers**, Infinite Scroll will keep the app light and agile.

---

## 🎨 5. Latte Art & Presentation (UI/UX)

- **Tailwind Design System** — Extracting inline styles into a centralized `tailwind.config.ts`. The `#4B3621` (Coffee Brown) palette must be consistent across the Dashboard and Chatbot.
- **Enhanced Empty States** — Replacing boring empty screens with interactive "How to Brew" onboarding guides for new users.

---

## 🚀 Why This "Brew" Matters

| Goal | Description |
|---|---|
| ☕ **High Caffeine** | **Scalability** — Ready to handle thousands of customers without performance lag. |
| 🧼 **Clean Cup** | **Maintainability** — Modular code that any developer can understand and maintain. |
| 🌿 **Perfect Aroma** | **Accuracy** — AI Mimi will provide much more precise answers via standardized data context. |

---

## 💡 Engineering Note for Reviewers

> *"My top priority in this refactor is **Unified Embedding** and **TanStack Query**. In an AI-driven CRM, data accuracy and fetching speed are the core values. A 'clean brew' starts with a solid data foundation."*