# AI Prompts — Kopi Kita CRM

Documents all AI prompts, models, and retrieval strategies used in the application.

← [Back to README](./README.md) · [Refactor Roadmap](./REFACTOR.md)

---

## 1. Promo Generation

**File:** `lib/groq.ts` → `generatePromos`  
**Endpoint:** `POST /api/promo`  
**Model:** Groq — `llama-3.3-70b-versatile`  
**Purpose:** Analyze customer interest tags and generate 3 weekly promo themes with target segments and ready-to-send messages.

### Prompt
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
6. ALL text fields MUST be written in Bahasa Indonesia
```

**Input:** Top 15 interest tags + total customer count  
**Output:** JSON array of 3 promo objects

---

## 2. AI Chatbot (Mimi)

**File:** `lib/groq.ts` → `chat`  
**Endpoint:** `POST /api/chat`  
**Model:** Groq — `llama-3.3-70b-versatile`  
**Purpose:** Answer questions about customer data using RAG with vector search and keyword fallback.

### System Prompt
```
Kamu adalah asisten AI Mimi di Kopi Kita coffee shop yang cerdas dan helpful.

DATA CUSTOMER YANG TERSEDIA:
{customerContext}

CARA MENJAWAB:
- Jawab dalam Bahasa Indonesia yang santai dan ramah
- Jika pertanyaan tentang "siapa" atau meminta daftar customer → WAJIB sebutkan nama-nama customer spesifik beserta detail relevannya (minuman favorit, tags)
- Jika pertanyaan tentang jumlah → hitung dari data dan berikan angka pasti
- Jika pertanyaan tentang rekomendasi promo → sebut nama customer yang cocok di-target
- Jika pertanyaan tentang segmen → kelompokkan customer berdasarkan tags dan sebutkan nama-namanya
- JANGAN bilang "data tidak cukup" jika data customer sudah tersedia di atas
- Format jawaban yang melibatkan banyak nama: gunakan bullet point atau daftar bernomor
- Jawaban singkat, padat, dan actionable
- Boleh pakai emoji sesekali ☕
```

### RAG Context Strategy

| Step | Action |
|---|---|
| 1 | Embed user query via OpenRouter |
| 2 | Vector search via `match_customers` RPC (threshold `0.3`, limit `15`) |
| 3 | Keyword search by customer name |
| 4 | Merge + deduplicate results |
| 5 | If results < 5 → fallback to all customers |
| 6 | Build context string: name, contact, favorite drink, tags |

**Input:** User message + customer context + last 6 messages of chat history  
**Output:** Natural language response in Bahasa Indonesia

---

## 3. Customer Embedding

**File:** `lib/openrouter.ts` → `embedText`  
**Endpoints:** `POST /api/seed`, `POST /api/customers`, `PUT /api/customers/[id]`  
**Model:** OpenRouter embedding model  
**Purpose:** Generate vector embeddings per customer for semantic search in the chatbot.

### Text Format
```
{favorite_drink}. Interests: {tags joined by ", "}
```

**Example:**
```
Caramel Cold Brew. Interests: sweet drinks, caramel, extra ice
```

**Dimensions:** 1536 (stored in Supabase `pgvector` column)

---

## 4. Vector Search RPC

**Function:** `match_customers` (Supabase RPC)  
**Used in:** `POST /api/chat`  
**Purpose:** Return the most semantically similar customers to a given query embedding.
```sql
SELECT id, name, contact, favorite_drink, tags,
  1 - (embedding <=> query_embedding) AS similarity
FROM customers
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY similarity DESC
LIMIT match_count;
```

| Parameter | Value | Notes |
|---|---|---|
| `match_threshold` | `0.3` | Lower = more permissive results |
| `match_count` | `15` | Max customers returned per query |