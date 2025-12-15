import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const FREE_EVALUATION_LIMIT = 10;

type SubscriptionRow = {
  tier: "free" | "premium";
  current_period_end: string | null;
} | null;

function isPremiumSubscription(sub: SubscriptionRow) {
  if (!sub) return false;
  if (sub.tier !== "premium") return false;
  if (!sub.current_period_end) return true;
  return new Date(sub.current_period_end).getTime() > Date.now();
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("tier, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    let subscription: SubscriptionRow = sub ?? null;

    if (subError) console.error("Error fetching subscription:", subError);

    const isPremium = isPremiumSubscription(subscription);

    const { count, error: countError } = await supabase
      .from("habit_plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error counting habit plans:", countError);
      return NextResponse.json({ error: "Failed to load usage" }, { status: 500 });
    }

    const evaluationCount = count ?? 0;
    const freeRemaining = Math.max(0, FREE_EVALUATION_LIMIT - evaluationCount);

    return NextResponse.json({
      isPremium,
      tier: isPremium ? "premium" : "free",
      evaluationCount,
      freeLimit: FREE_EVALUATION_LIMIT,
      freeRemaining,
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { error: "Failed to load user info" },
      { status: 500 }
    );
  }
}
