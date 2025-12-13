import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

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
