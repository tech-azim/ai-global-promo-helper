// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embeddingService } from "@/lib/openrouter";
import { llmService } from "@/lib/groq";
import { requireAuth } from "@/lib/auth";

// Harus sama dengan convertEmbeddingDimension di seed/route.ts
function convertEmbeddingDimension(
  embedding: number[],
  targetDim: number,
): number[] {
  if (embedding.length === targetDim) return embedding;
  const result: number[] = [];
  const ratio = embedding.length / targetDim;
  for (let i = 0; i < targetDim; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    const chunk = embedding.slice(start, end);
    result.push(chunk.reduce((a, b) => a + b, 0) / chunk.length);
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Step 1: Embed + convert ke 768 dimensi (sama dengan customer embeddings di DB)
    const rawEmbedding = await embeddingService.embedText(message);
    const queryEmbedding = convertEmbeddingDimension(rawEmbedding, 768);

    // Step 2: Vector search — semantically similar customers
    const { data: similarCustomers } = await supabaseAdmin.rpc(
      "match_customers",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 15,
      },
    );

    // Step 3: Keyword fallback — cari by nama
    const { data: nameMatches } = await supabaseAdmin
      .from("customers")
      .select("id, name, contact, favorite_drink, tags")
      .ilike("name", `%${message.split(" ")[0]}%`)
      .limit(5);

    // Step 4: Merge & deduplicate
    const allMatched = [...(similarCustomers ?? []), ...(nameMatches ?? [])];
    const seen = new Set();
    const uniqueMatched = allMatched.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // Step 5: Get total count
    const { count: totalCount } = await supabaseAdmin
      .from("customers")
      .select("*", { count: "exact", head: true });

    // Step 6: Jika hasil vector search < 5, fallback ke semua customer
    let contextCustomers = uniqueMatched;
    let contextNote = "";

    if (uniqueMatched.length < 5) {
      const { data: allCustomers } = await supabaseAdmin
        .from("customers")
        .select("id, name, contact, favorite_drink, tags")
        .order("created_at", { ascending: false });

      contextCustomers = allCustomers ?? [];
      contextNote = `(semua ${contextCustomers.length} customer)`;
    } else {
      contextNote = `(${uniqueMatched.length} customer paling relevan dari total ${totalCount})`;
    }

    // Step 7: Build context string
    let customerContext = "";
    if (contextCustomers.length > 0) {
      customerContext = `Data customer Kopi Kita ${contextNote}:\n`;
      customerContext += contextCustomers
        .map(
          (c) =>
            `- ${c.name}${c.contact ? ` (${c.contact})` : ""}: minuman favorit "${c.favorite_drink ?? "belum diisi"}", tags: [${c.tags?.join(", ")}]`,
        )
        .join("\n");
      customerContext += `\n\nTotal seluruh customer: ${totalCount}`;
    } else {
      customerContext = `Total customer: ${totalCount}. Belum ada data detail customer.`;
    }

    // Step 8: Generate response
    const answer = await llmService.chat(message, customerContext, history);

    return NextResponse.json({
      answer,
      relevantCustomers: contextCustomers.length,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 },
    );
  }
}
