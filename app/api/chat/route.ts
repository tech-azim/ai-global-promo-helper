// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embeddingService } from "@/lib/openrouter";
import { llmService } from "@/lib/groq";
import { requireAuth } from "@/lib/auth";
import { getWeekLabel } from "@/lib/utils";

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

    // Step 1: Embed + convert ke 768 dimensi
    const rawEmbedding = await embeddingService.embedText(message);
    const queryEmbedding = convertEmbeddingDimension(rawEmbedding, 768);

    // Step 2: Vector search + keyword search + promo fetch — parallel
    const [
      { data: similarCustomers },
      { data: nameMatches },
      { data: campaigns },
      { count: totalCount },
    ] = await Promise.all([
      supabaseAdmin.rpc("match_customers", {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 15,
      }),
      supabaseAdmin
        .from("customers")
        .select("id, name, contact, favorite_drink, tags")
        .ilike("name", `%${message.split(" ")[0]}%`)
        .limit(5),
      supabaseAdmin
        .from("promo_campaigns")
        .select(
          "theme, segment_description, target_tags, target_count, why_now, message, best_time, week_label",
        )
        .order("generated_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true }),
    ]);

    // Step 3: Merge & deduplicate customers
    const allMatched = [...(similarCustomers ?? []), ...(nameMatches ?? [])];
    const seen = new Set();
    const uniqueMatched = allMatched.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // Step 4: Fallback ke semua customer jika hasil < 5
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

    // Step 5: Build customer context
    let customerContext = "";
    if (contextCustomers.length > 0) {
      customerContext = `DATA CUSTOMER ${contextNote}:\n`;
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

    // Step 6: Build promo context
    let promoContext = "";
    if (campaigns && campaigns.length > 0) {
      const weekLabel = getWeekLabel();
      const thisWeek = campaigns.filter((c) => c.week_label === weekLabel);
      const older = campaigns.filter((c) => c.week_label !== weekLabel);

      promoContext = "\n\nDATA PROMO CAMPAIGNS:\n";

      if (thisWeek.length > 0) {
        promoContext += `Promo minggu ini (${weekLabel}):\n`;
        promoContext += thisWeek
          .map(
            (c) =>
              `- Tema: "${c.theme}" | Target: ${c.segment_description} (${c.target_count} customer) | Tags: [${c.target_tags?.join(", ")}] | Kenapa sekarang: ${c.why_now} | Pesan: "${c.message}" | Waktu terbaik: ${c.best_time}`,
          )
          .join("\n");
      }

      if (older.length > 0) {
        promoContext += `\nPromo sebelumnya:\n`;
        promoContext += older
          .map(
            (c) =>
              `- [${c.week_label}] "${c.theme}" — ${c.segment_description}`,
          )
          .join("\n");
      }
    } else {
      promoContext = "\n\nBelum ada promo campaign yang digenerate.";
    }

    // Step 7: Combine full context
    const fullContext = customerContext + promoContext;

    // Step 8: Generate response
    const answer = await llmService.chat(message, fullContext, history);

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
