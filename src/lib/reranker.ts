// src/lib/reranker.ts
import { CohereClient } from "cohere-ai";

interface CustomerWithScore {
  id: string;
  name: string;
  contact?: string;
  favorite_drink?: string;
  tags?: string[];
  relevance_score?: number;
}

class RerankerService {
  private cohere: CohereClient;

  constructor() {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error("COHERE_API_KEY is not configured");
    this.cohere = new CohereClient({ token: apiKey });
  }

  /**
   * Rerank customers based on query relevance using Cohere
   * @param query - User's original question
   * @param customers - Retrieved customers from vector + keyword search
   * @param topK - Number of top results to return (default: 7)
   * @returns Reranked customers sorted by relevance score
   */
  async rerank(
    query: string,
    customers: CustomerWithScore[],
    topK: number = 7,
  ): Promise<CustomerWithScore[]> {
    if (customers.length === 0) {
      console.log("⚠️  No customers to rerank");
      return [];
    }

    try {
      console.log(
        `🔄 Reranking ${customers.length} customers for query: "${query}"`,
      );

      // Build document strings for each customer
      const documents = customers.map(
        (c) =>
          `Name: ${c.name}, Contact: ${c.contact || "N/A"}, Favorite: ${c.favorite_drink || "N/A"}, Tags: ${c.tags?.join(", ") || "N/A"}`,
      );

      // Call Cohere rerank API
      const response = await this.cohere.rerank({
        model: "rerank-english-v3.0",
        query: query,
        documents: documents,
        topN: Math.min(topK, customers.length),
      });

      // Map reranked results back to customer objects
      const rerankedCustomers = response.results
        .map((result) => {
          const customer = customers[result.index];
          return {
            ...customer,
            relevance_score: result.relevanceScore,
          };
        })
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      console.log(
        `✅ Reranking complete. Top ${rerankedCustomers.length} customers selected.`,
      );
      console.log(
        "Scores:",
        rerankedCustomers
          .map((c) => `${c.name}: ${c.relevance_score?.toFixed(3)}`)
          .join(", "),
      );

      return rerankedCustomers;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("❌ Reranking error:", errorMsg);
      // Fallback: return original customers if reranking fails
      return customers;
    }
  }
}

export const rerankerService = new RerankerService();
