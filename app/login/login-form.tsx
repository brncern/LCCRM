"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "linkSent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) {
      setState("idle");
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "E-posta ya da şifre hatalı. Henüz şifre belirlemediysen aşağıdaki bağlantıyla gir."
          : error.message,
      );
      return;
    }
    window.location.assign("/");
  }

  async function sendLink() {
    if (!email) {
      setError("Önce e-postanı yaz.");
      return;
    }
    setState("busy");
    setError(null);
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      // Erişim ALLOWED_EMAILS (middleware) ve app_admins (RLS) ile kısıtlı.
      options: { emailRedirectTo: `${site}/auth/callback?next=/settings` },
    });
    if (error) {
      setState("idle");
      setError(error.message);
    } else {
      setState("linkSent");
    }
  }

  if (state === "linkSent") {
    return (
      <p role="status" style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>
        <strong>{email}</strong> adresine giriş bağlantısı gönderildi. Bağlantıyla girince şifreni belirleyebilirsin.
      </p>
    );
  }

  return (
    <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="field">
        E-POSTA
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="field">
        ŞİFRE
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error ? (
        <span role="alert" className="tone-down" style={{ fontSize: 13, lineHeight: 1.4 }}>
          {error}
        </span>
      ) : null}
      <button type="submit" className="btn btn--primary btn--block" disabled={state === "busy"}>
        {state === "busy" ? "Giriliyor…" : "Giriş yap"}
      </button>
      <button
        type="button"
        onClick={sendLink}
        disabled={state === "busy"}
        style={{ border: 0, background: "transparent", color: "var(--blue-text)", fontSize: 13, minHeight: 36 }}
      >
        Şifremi unuttum / e-posta bağlantısıyla gir
      </button>
    </form>
  );
}
