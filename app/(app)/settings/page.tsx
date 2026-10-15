import { PageHead } from "@/components/ui";
import { supabaseConfigured, supabaseServer } from "@/lib/supabase/server";
import { PasswordForm, SignOutButton } from "./settings-forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  let email: string | null = null;
  if (supabaseConfigured()) {
    const { data } = await (await supabaseServer()).auth.getUser();
    email = data.user?.email ?? null;
  }

  return (
    <main className="content">
      <PageHead eyebrow={email ?? "Örnek veri modu"} title="Ayarlar" />
      <section className="card" aria-labelledby="pw-h" style={{ maxWidth: 520 }}>
        <h2 id="pw-h" className="card-title">Şifre</h2>
        <p className="kpi-note" style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>
          Şifre belirledikten sonra e-posta bağlantısı beklemeden e-posta ve şifrenle giriş yaparsın.
        </p>
        {email ? <PasswordForm email={email} /> : <p className="kpi-note">Giriş yapılmamış.</p>}
      </section>
      {email ? (
        <section className="card" aria-labelledby="out-h" style={{ maxWidth: 520 }}>
          <h2 id="out-h" className="card-title">Oturum</h2>
          <SignOutButton />
        </section>
      ) : null}
    </main>
  );
}
