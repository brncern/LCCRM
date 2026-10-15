import { IconScale } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="desktop">
      <main className="login">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="app-icon" aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <IconScale size={24} style={{ color: "#fff" }} />
          </span>
          <div className="stack">
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>LawChat CRM</h1>
            <span className="kpi-note">E-postana bir giriş bağlantısı gönderelim.</span>
          </div>
        </div>
        {e === "yetkisiz" ? (
          <p role="alert" className="tone-down" style={{ margin: 0, fontSize: 13 }}>
            Bu e-posta adresinin giriş izni yok.
          </p>
        ) : null}
        {e === "baglanti" ? (
          <p role="alert" className="tone-down" style={{ margin: 0, fontSize: 13 }}>
            Giriş bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste.
          </p>
        ) : null}
        {configured ? (
          <LoginForm />
        ) : (
          <p className="kpi-note" style={{ margin: 0 }}>
            Supabase ayarlı değil; uygulama örnek veri modunda girişsiz çalışıyor.
          </p>
        )}
      </main>
    </div>
  );
}
