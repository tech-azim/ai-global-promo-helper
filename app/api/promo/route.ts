// src/app/api/promo/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { llmService } from "@/lib/groq";
import { requireAuth } from "@/lib/auth";
import { computeTagFrequency, getWeekLabel } from "@/lib/utils";
import { Customer } from "@/types";

export async function POST() {
  try {
    await requireAuth();

    // Fetch all customers
    const { data: customers, error } = await supabaseAdmin
      .from("customers")
      .select("id, name, tags, favorite_drink");

    if (error) throw error;
    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: "No customers found" },
        { status: 400 },
      );
    }

    // Compute tag frequency
    const tagFrequency = computeTagFrequency(customers as Customer[]);
    const weekLabel = getWeekLabel();

    // Generate promos with Groq LLM
    const promos = await llmService.generatePromos(
      tagFrequency,
      customers.length,
    );

    // Delete old campaigns for this week, insert new ones
    await supabaseAdmin
      .from("promo_campaigns")
      .delete()
      .eq("week_label", weekLabel);

    const campaignsToInsert = promos.map((p) => ({
      theme: p.theme,
      segment_description: p.segment_description,
      target_tags: p.target_tags,
      target_count: p.target_count,
      why_now: p.why_now,
      message: p.message,
      best_time: p.best_time ?? null,
      week_label: weekLabel,
    }));

    const { data: saved, error: saveError } = await supabaseAdmin
      .from("promo_campaigns")
      .insert(campaignsToInsert)
      .select();

    if (saveError) throw saveError;

    return NextResponse.json({ data: saved, tagFrequency });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Promo generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate promos" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await requireAuth();

    const weekLabel = getWeekLabel();

    const { data, error } = await supabaseAdmin
      .from("promo_campaigns")
      .select("*")
      .eq("week_label", weekLabel)
      .order("generated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 },
    );
  }
}
