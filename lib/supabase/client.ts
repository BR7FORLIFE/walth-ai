import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(url, anonKey);

/**
 * Explicacion de porque debe ser una constante y no una funcion
 *
 * - Al ser una contante nosotros devolvemos una instancia
 * - una funciona de por si no se considera un singleton y menos una instancia real de algo
 */
