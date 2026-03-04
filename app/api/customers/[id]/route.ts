// app/api/customers/[id]/route.ts
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const { name, contact, favorite_drink, tags } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    // Re-generate embedding dengan data terbaru
    let embedding = null;
    const textToEmbed = embeddingService.buildCustomerText(
      favorite_drink ?? "",
      tags ?? [],
    );
    if (textToEmbed.trim()) {
      const raw = await embeddingService.embedText(textToEmbed);
      embedding = raw;
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({
        name: name.trim(),
        contact: contact?.trim() || null,
        favorite_drink: favorite_drink?.trim() || null,
        tags: tags ?? [],
        ...(embedding && { embedding }),
      })
      .eq("id", id)
      .select("id, name, contact, favorite_drink, tags, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
