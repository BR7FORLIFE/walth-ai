import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type SubscriptionRow = {
    tier: 'free' | 'premium';
    current_period_end: string | null;
} | null;

function isPremiumSubscription(sub: SubscriptionRow) {
    if (!sub) return false;
    if (sub.tier !== 'premium') return false;
    if (!sub.current_period_end) return true;
    return new Date(sub.current_period_end).getTime() > Date.now();
}

type UiMessage = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    parts: Array<{ type: 'text'; text: string }>;
};

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        let subscription: SubscriptionRow = null;
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('tier, current_period_end')
            .eq('user_id', user.id)
            .maybeSingle();

        if (subError) {
            // If the table isn't created yet, treat as free (chat is premium-only).
            console.error('Error fetching subscription:', subError);
        } else {
            subscription = (sub as SubscriptionRow) ?? null;
        }

        const isPremium = isPremiumSubscription(subscription);
        if (!isPremium) {
            return NextResponse.json(
                {
                    error: 'Premium requerido para usar el chat.',
                    code: 'PREMIUM_REQUIRED',
                },
                { status: 403 }
            );
        }

        // If the table doesn't exist yet, return empty history.
        const { data, error } = await supabase
            .from('chat_messages')
            .select('id, role, content')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error('Error fetching chat history:', error);
            return NextResponse.json({ messages: [] satisfies UiMessage[] });
        }

        const messages: UiMessage[] = (data ?? []).map((row) => ({
            id: row.id as string,
            role: (row.role as UiMessage['role']) ?? 'assistant',
            parts: [{ type: 'text', text: String(row.content ?? '') }],
        }));

        return NextResponse.json({ messages });
    } catch (err) {
        console.error('Error in chat history route:', err);
        return NextResponse.json({ messages: [] });
    }
}
