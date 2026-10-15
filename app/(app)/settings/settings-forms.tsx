"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function PasswordForm({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setStatus({ ok: false, text: "Şifre en az 8 karakter olmalı." });
    if (password !== confirm) return setStatus({ ok: false, text: "Şifreler aynı değil." });
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) setStatus({ ok: false, text: error.message });
    else {
      setStatus({ ok: true, text: "Şifre kaydedildi. Bundan sonra e-posta ve şifrenle giriş yapabilirsin." });
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Tarayıcının şifreyi doğru hesaba kaydetmesi için */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <label className="field">
        YENİ ŞİFRE
        <input type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label className="field">
        YENİ ŞİFRE (TEKRAR)
        <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {status ? (
        <span role="status" className={status.ok ? "tone-up" : "tone-down"} style={{ fontSize: 13 }}>
          {status.text}
        </span>
      ) : null}
      <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-start" }} disabled={busy}>
        {busy ? "Kaydediliyor…" : "Şifreyi kaydet"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      className="btn btn--plain"
      style={{ alignSelf: "flex-start" }}
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        window.location.assign("/login");
      }}
    >
      Çıkış yap
    </button>
  );
}
