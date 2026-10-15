import { createClient } from "@supabase/supabase-js";

/**
 * Yönetici istemcisi: RLS'i atlar. SADECE sunucuda, senkron işleri ve webhook'lar için kullan.
 * Anahtar: Supabase → Project Settings → API Keys → secret (ya da eski service_role) anahtarı.
 */
export function supabaseAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
