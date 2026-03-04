// src/lib/embedding.ts

class EmbeddingService {
  private apiKey: string;
  private model = "openai/text-embedding-3-small";

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
    this.apiKey = apiKey;
  }

  /**
   * Convert text to real embedding using OpenRouter
   */
  async embedText(text: string): Promise<number[]> {
    try {
      console.log(
        "📝 Generating embedding for:",
        text.substring(0, 50) + "...",
      );

      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      const embedding = data.data[0].embedding;

      console.log("✅ Embedding generated, dimensions:", embedding.length);

      return embedding;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      console.error("❌ Embedding error:", errorMsg);
      throw new Error(`Embedding failed: ${errorMsg}`);
    }
  }

  /**
   * Build a combined text from customer data
   */
  buildCustomerText(favoriteDrink: string, tags: string[]): string {
    return [favoriteDrink, ...tags].filter(Boolean).join(", ");
  }
}

export const embeddingService = new EmbeddingService();
