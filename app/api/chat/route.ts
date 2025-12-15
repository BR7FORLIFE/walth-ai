import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import type { CoreMessage } from "ai";
import { supabase } from "@lib/supabase/client";

export const runtime = "edge";

type UiTextPart = { type: "text"; text: string };
type IncomingMessage = {
    role?: "user" | "assistant" | "system" | string;
    parts?: Array<{ type?: string; text?: unknown } | null>;
    content?: unknown;
} | null;

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

function extractLastUserText(messages: IncomingMessage[]): string | null {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const m = messages[i];
        if (!m || m.role !== "user") continue;

        // Vercel AI UIMessage: parts: [{ type: 'text', text: '...' }]
        if (Array.isArray(m.parts)) {
            const text = m.parts
                .filter((p): p is UiTextPart => p?.type === "text")
                .map((p) => String(p.text ?? ""))
                .join("");
            if (text.trim().length > 0) return text;
        }

        // Fallback shape
        if (typeof m.content === "string" && m.content.trim().length > 0) {
            return m.content;
        }
    }
    return null;
}

export async function POST(req: Request) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return new Response(
            "Missing env var GOOGLE_GENERATIVE_AI_API_KEY. Add it to .env.local.",
            { status: 500 }
        );
    }

    const body = (await req.json().catch(() => ({} as unknown))) as unknown;
    const maybeMessages =
        typeof body === "object" && body !== null
            ? (body as { messages?: unknown }).messages
            : undefined;
    const messages: IncomingMessage[] = Array.isArray(maybeMessages)
        ? (maybeMessages as IncomingMessage[])
        : [];
    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

    const userText = extractLastUserText(messages);
    if (!userText) {
        return new Response("Missing user message", { status: 400 });
    }

    // Chat is premium-only.
    // We enforce this at the API level to prevent bypassing the UI.
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return new Response("Usuario no autenticado", { status: 401 });
    }

    let subscription: SubscriptionRow = null;
    const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("tier, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subError) {
        // If the table isn't created yet, treat as free (chat is premium-only).
        console.error("Error fetching subscription:", subError);
    } else {
        subscription = (sub as SubscriptionRow) ?? null;
    }

    const isPremium = isPremiumSubscription(subscription);
    if (!isPremium) {
        return new Response("Premium requerido para usar el chat.", {
            status: 403,
        });
    }

    // Load user context (auth + latest plan + recent chat history) from Supabase.
    // If anything fails (e.g., missing table), we still run the chat without history.
    const username: string | null =
        (user.user_metadata?.username as string | undefined) ?? null;
    let latestPlanSummary: string | null = null;
    let history: Array<{ role: "user" | "assistant"; content: string }> = [];
    const userId: string = user.id;

    try {
        const { data: plan } = await supabase
            .from("habit_plans")
            .select("summary")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        latestPlanSummary = (plan?.summary as string | undefined) ?? null;

        const { data: rows, error: historyError } = await supabase
            .from("chat_messages")
            .select("id, role, content")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (historyError) {
            console.error("Error fetching chat_messages:", historyError);
        } else {
            history = (rows ?? [])
                .map((r) => ({
                    role: (r.role as "user" | "assistant") ?? "assistant",
                    content: String(r.content ?? ""),
                }))
                .reverse();
        }

        // Persist user message best-effort.
        const { error: insertUserError } = await supabase
            .from("chat_messages")
            .insert({ user_id: userId, role: "user", content: userText });
        if (insertUserError) {
            console.error(
                "Error inserting user chat message:",
                insertUserError
            );
        }
    } catch (e) {
        console.error("Chat context load failed:", e);
    }

    const systemPromptParts: string[] = [
        "Eres WelthIA, un asistente de hábitos y bienestar. Responde en español, con tono claro, empático y accionable.",
        "Personaliza tus respuestas usando el historial del usuario cuando sea relevante.",
    ];
    if (username) systemPromptParts.push(`Nombre de usuario: ${username}.`);
    if (latestPlanSummary)
        systemPromptParts.push(
            `Resumen del último plan del usuario (usa esto como contexto):\n${latestPlanSummary}`
        );
    const systemPrompt = systemPromptParts.join("\n\n");

    const coreMessages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: userText },
    ];

    const result = streamText({
        model: google(modelName),
        messages: coreMessages,
        onFinish: async ({ text }) => {
            const assistantText = String(text ?? "").trim();
            if (!assistantText) return;

            try {
                const { error } = await supabase
                    .from("chat_messages")
                    .insert({
                        user_id: userId,
                        role: "assistant",
                        content: assistantText,
                    });
                if (error) {
                    console.error(
                        "Error inserting assistant chat message:",
                        error
                    );
                }
            } catch (e) {
                console.error("Error persisting assistant message:", e);
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
