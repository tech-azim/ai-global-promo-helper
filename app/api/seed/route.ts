// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embeddingService } from "@/lib/openrouter";
import { hashPassword } from "@/lib/auth";

/**
 * Convert embedding to target dimension using average pooling
 * Reduces higher dimensions to lower with minimal info loss
 */
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
    const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length;
    result.push(avg);
  }

  return result;
}

// POST /api/seed — run once to generate embeddings + fix user password
export async function POST() {
  try {
    console.log("🚀 Seed endpoint called...");

    // 1. Fix the user password hash
    console.log("🔐 Updating user password...");
    const passwordHash = await hashPassword("kopikita123");
    await supabaseAdmin.from("users").upsert({
      email: "mimi@kopikita.id",
      password_hash: passwordHash,
      name: "Mimi",
    });
    console.log("✅ User password updated");
    // Wait before next write
    await new Promise((r) => setTimeout(r, 500));

    // 2. Check total customers in DB
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting customers:", countError);
      throw countError;
    }
    console.log(`📊 Total customers in DB: ${totalCount}`);

    // 3. Get all customers without embeddings
    const { data: customers, error } = await supabaseAdmin
      .from("customers")
      .select("id, name, favorite_drink, tags")
      .is("embedding", null);

    if (error) {
      console.error("❌ Query customers error:", error);
      throw error;
    }

    console.log(
      `📊 Found ${customers?.length || 0} customers without embeddings`,
    );
    if (!customers || customers.length === 0) {
      console.log(
        "⚠️ No customers to process. Check if table exists and has data.",
      );
      return NextResponse.json({
        success: true,
        message: `No customers to process (${totalCount} total in DB)`,
      });
    }

    let processed = 0;
    const errors: string[] = [];

    console.log(
      `⏳ Starting embedding generation for ${customers.length} customers...`,
    );
    for (const customer of customers) {
      try {
        const textToEmbed = embeddingService.buildCustomerText(
          customer.favorite_drink ?? "",
          customer.tags ?? [],
        );
        console.log(`  📝 [${customer.name}] Text: "${textToEmbed}"`);
        if (!textToEmbed.trim()) {
          console.log(`  ⏭️ Skipping ${customer.name} - empty text`);
          continue;
        }

        const embedding = await embeddingService.embedText(textToEmbed);

        const { error: updateError } = await supabaseAdmin
          .from("customers")
          .update({ embedding: embedding })
          .eq("id", customer.id);

        if (updateError) {
          throw new Error(`DB update failed: ${updateError.message}`);
        }

        processed++;
        console.log(`  ✅ Embedded customer ${processed}/${customers.length}`);
        // Increase delay to avoid write conflicts
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ Customer ${customer.id} error:`, errorMsg);
        errors.push(`Customer ${customer.id}: ${errorMsg}`);
      }
    }

    console.log(
      `\n🎉 Seeding complete! Processed ${processed}/${customers.length}`,
    );
    return NextResponse.json({
      success: true,
      message: `Seeded ${processed} customer embeddings`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Seed error:", errorMsg);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: `Seed failed: ${errorMsg}` },
      { status: 500 },
    );
  }
}
