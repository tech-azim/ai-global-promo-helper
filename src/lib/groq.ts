// src/lib/groq.ts
import Groq from "groq-sdk";
import { PromoTheme, TagCount } from "@/types";

class LLMService {
  private groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    this.groq = new Groq({ apiKey });
  }

  async generatePromos(
    tagFrequency: TagCount[],
    totalCustomers: number,
  ): Promise<PromoTheme[]> {
    const tagSummary = tagFrequency
      .slice(0, 15)
      .map((t) => `"${t.tag}": ${t.count} customers`)
      .join("\n");

    const prompt = `You are a smart marketing assistant for "Kopi Kita", a trendy Indonesian coffee shop.

Based on the customer interest data below, generate exactly 3 promo themes for this week.

CUSTOMER DATA:
Total customers: ${totalCustomers}
Top interest tags:
${tagSummary}

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
6. ALL text fields (theme, segment_description, why_now, message, best_time) MUST be written in Bahasa Indonesia`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const text = response.choices[0].message.content ?? "";
      return this.parsePromos(text);
    } catch (error) {
      console.error("Groq promo generation error:", error);
      throw new Error("Failed to generate promos");
    }
  }

  async chat(
    userMessage: string,
    customerContext: string,
    chatHistory: { role: "user" | "assistant"; content: string }[],
  ): Promise<string> {
    const systemPrompt = `Kamu adalah asisten AI Mimi di Kopi Kita coffee shop yang cerdas dan helpful.

DATA CUSTOMER YANG TERSEDIA:
${customerContext}

CARA MENJAWAB:
- Jawab dalam Bahasa Indonesia yang santai dan ramah
- Jika pertanyaan tentang "siapa" atau meminta daftar customer → WAJIB sebutkan nama-nama customer spesifik dari data di atas beserta detail relevannya (minuman favorit, tags)
- Jika pertanyaan tentang jumlah → hitung dari data dan berikan angka pasti
- Jika pertanyaan tentang rekomendasi promo → sebut nama customer yang cocok di-target
- Jika pertanyaan tentang segmen → kelompokkan customer berdasarkan tags dan sebutkan nama-namanya
- JANGAN bilang "data tidak cukup" jika data customer sudah tersedia di atas — gunakan data tersebut
- Format jawaban yang melibatkan banyak nama: gunakan bullet point atau daftar bernomor
- Jawaban singkat, padat, dan actionable
- Boleh pakai emoji sesekali ☕`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...chatHistory.slice(-6),
      { role: "user" as const, content: userMessage },
    ];

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.5,
        max_tokens: 800,
      });

      return (
        response.choices[0].message.content ??
        "Maaf, tidak bisa menjawab saat ini."
      );
    } catch (error) {
      console.error("Groq chat error:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  private parsePromos(text: string): PromoTheme[] {
    try {
      let clean = text.trim();
      clean = clean
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed.promos) && parsed.promos.length > 0) {
        return parsed.promos;
      }
      throw new Error("Invalid promo structure");
    } catch (error) {
      console.error("Failed to parse promos:", text);
      return [
        {
          theme: "Promo Mingguan Spesial",
          segment_description: "Semua pelanggan setia",
          target_tags: ["sweet drinks"],
          target_count: 0,
          why_now: "Minggu ini adalah waktu yang tepat untuk reward pelanggan",
          message:
            "Hi! Ada promo spesial minggu ini buat kamu. Yuk mampir ke Kopi Kita! ☕",
          best_time: "Setiap hari",
        },
      ];
    }
  }
}

export const llmService = new LLMService();
