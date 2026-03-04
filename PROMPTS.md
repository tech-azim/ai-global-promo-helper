# AI Prompts — Kopi Kita CRM

This file documents all AI prompts used in the application.

---

## 1. Global Promo Generation (`lib/groq.ts` → `generatePromos`)

**Model:** `llama-3.3-70b-versatile` (Groq)  
**Used in:** `POST /api/promo`  
**Purpose:** Analyze customer interest tags and generate 3 weekly promo themes with target segments and ready-to-send messages.

```
You are a smart marketing assistant for "Kopi Kita", a trendy Indonesian coffee shop.

Based on the customer interest data below, generate exactly 3 promo themes for this week.

CUSTOMER DATA:
Total customers: {totalCustomers}
Top interest tags:
{tagSummary}

Return ONLY valid JSON (no markdown, no explanation):
{
  "promos": [
    {
      "theme": "Short catchy promo name",
      "segment_description": "Description of who to target",
      "target_tags": ["tag1", "tag2"],
      "target_count": 0,
      "why_now": "One line reason based on the data trends",
      "message": "Ready-to-send WhatsApp/IG DM message in mix of Indonesian and English, friendly, with emoji and clear CTA",
      "best_time": "e.g. Pagi hari 07.00-10.00 or Weekend"
    }
  ]
}

RULES:
1. Create exactly 3 promo themes targeting different segments
2. target_count should reflect how many customers have those tags
3. message must be 1-2 sentences, conversational, include emoji, end with a question or CTA
4. why_now must reference actual numbers from the data
5. Respond ONLY with the JSON object
6. ALL text fields (theme, segment_description, why_now, message, best_time) MUST be written in Bahasa Indonesia
```

**Input:** Tag frequency array (top 15 tags) + total customer count  
**Output:** JSON array of 3 promo themes

---

## 2. AI Chatbot (`lib/groq.ts` → `chat`)

**Model:** `llama-3.3-70b-versatile` (Groq)  
**Used in:** `POST /api/chat`  
**Purpose:** Answer questions about customer data using RAG (Retrieval-Augmented Generation) with vector search + keyword fallback.

### System Prompt:
```
Kamu adalah asisten AI Mimi di Kopi Kita coffee shop yang cerdas dan helpful.

DATA CUSTOMER YANG TERSEDIA:
{customerContext}

CARA MENJAWAB:
- Jawab dalam Bahasa Indonesia yang santai dan ramah
- Jika pertanyaan tentang "siapa" atau meminta daftar customer → WAJIB sebutkan nama-nama customer spesifik dari data di atas beserta detail relevannya (minuman favorit, tags)
- Jika pertanyaan tentang jumlah → hitung dari data dan berikan angka pasti
- Jika pertanyaan tentang rekomendasi promo → sebut nama customer yang cocok di-target
- Jika pertanyaan tentang segmen → kelompokkan customer berdasarkan tags dan sebutkan nama-namanya
- JANGAN bilang "data tidak cukup" jika data customer sudah tersedia di atas — gunakan data tersebut
- Format jawaban yang melibatkan banyak nama: gunakan bullet point atau daftar bernomor
- Jawaban singkat, padat, dan actionable
- Boleh pakai emoji sesekali ☕
```

**Context building strategy:**
1. Embed user query → vector search (`match_customers` RPC, threshold 0.3)
2. Keyword search by customer name
3. Merge + deduplicate results
4. If results < 5 → fallback to all customers
5. Build context string with name, contact, favorite drink, tags

**Input:** User message + customer context + last 6 chat history messages  
**Output:** Natural language response in Bahasa Indonesia

---

## 3. Customer Embedding (`lib/openrouter.ts` → `embedText`)

**Model:** OpenRouter embedding model  
**Used in:** `POST /api/seed`, `POST /api/customers`, `PUT /api/customers/[id]`  
**Purpose:** Generate vector embeddings for semantic search in the AI chatbot.

### Text format for embedding:
```
{buildCustomerText(favorite_drink, tags)}
```

Example output:
```
"Caramel Cold Brew. Interests: sweet drinks, caramel, extra ice"
```

**Dimension handling:**  
- Model output: 1536 dimensions  
- Database storage: 1536 dimensions 

---

## 4. Vector Search (`supabase` → `match_customers` RPC)

**Used in:** `POST /api/chat`  
**Purpose:** Find semantically similar customers to the user's query.

```sql
SELECT id, name, contact, favorite_drink, tags,
  1 - (embedding <=> query_embedding) AS similarity
FROM customers
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY similarity DESC
LIMIT match_count;
```

**Parameters:**
- `match_threshold`: 0.3 (lower = more results)
- `match_count`: 15

---

## Tech Stack

| Component | Technology |
|---|---|
| LLM (Promo + Chat) | Groq — `llama-3.3-70b-versatile` |
| Embeddings | OpenRouter |
| Vector DB | Supabase + pgvector |
| Framework | Next.js 15 |
| UI | Ant Design |