import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Sunucu bileşenleri ve route handler'lar için oturumlu istemci. */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Sunucu bileşeninden çağrıldığında cookie yazılamaz; middleware oturumu yeniler.
        }
      },
    },
  });
}
