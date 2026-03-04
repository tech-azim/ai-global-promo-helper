import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { computeTagFrequency, getWeekLabel } from "@/lib/utils";
import { Customer } from "@/types";

export async function GET() {
  try {
    await requireAuth();

    const weekLabel = getWeekLabel();
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [{ data: customers }, { data: campaigns }, { count: newThisWeek }] =
      await Promise.all([
        supabaseAdmin.from("customers").select("id, tags"),
        supabaseAdmin
          .from("promo_campaigns")
          .select("*")
          .eq("week_label", weekLabel)
          .order("generated_at", { ascending: false }),
        supabaseAdmin
          .from("customers")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo),
      ]);

    const topInterests = computeTagFrequency((customers ?? []) as Customer[]);

    return NextResponse.json({
      data: {
        total_customers: customers?.length ?? 0,
        top_interests: topInterests,
        this_week_campaigns: campaigns ?? [],
        new_customers_this_week: newThisWeek ?? 0,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}
