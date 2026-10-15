"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      // Yeni hesap açılmaz: kullanıcı Supabase panelinden önceden davet edilmiş olmalı.
      options: { emailRedirectTo: `${site}/auth/callback`, shouldCreateUser: false },
    });
    if (error) {
      setState("error");
      setError(error.message);
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>
        <strong>{email}</strong> adresine giriş bağlantısı gönderildi. Gelen kutunu kontrol et.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="field">
        E-POSTA
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error ? (
        <span role="alert" className="tone-down" style={{ fontSize: 13 }}>
          {error}
        </span>
      ) : null}
      <button type="submit" className="btn btn--primary btn--block" disabled={state === "sending"}>
        {state === "sending" ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}
