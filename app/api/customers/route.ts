// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embeddingService } from "@/lib/openrouter";
import { requireAuth } from "@/lib/auth";

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

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    let query = supabaseAdmin
      .from("customers")
      .select("id, name, contact, favorite_drink, tags, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,contact.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const { name, contact, favorite_drink, tags } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    // Generate embedding untuk customer baru
    let embedding = null;
    const textToEmbed = embeddingService.buildCustomerText(
      favorite_drink ?? "",
      tags ?? [],
    );
    if (textToEmbed.trim()) {
      const raw = await embeddingService.embedText(textToEmbed);
      embedding = convertEmbeddingDimension(raw, 768);
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .insert({
        name: name.trim(),
        contact: contact?.trim() || null,
        favorite_drink: favorite_drink?.trim() || null,
        tags: tags ?? [],
        embedding,
      })
      .select("id, name, contact, favorite_drink, tags, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
