"use client";

import { useState, useTransition } from "react";
import { syncNow } from "@/app/actions";

export function SyncButton({ lastLabel }: { lastLabel: string | null }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span role="status" className={message ? (message.ok ? "tone-up" : "tone-down") : "kpi-note"} style={{ fontSize: 12 }}>
        {message ? message.text : lastLabel ? `Son güncelleme ${lastLabel}` : null}
      </span>
      <button
        type="button"
        className="btn btn--plain"
        style={{ fontSize: 13, minHeight: 34 }}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await syncNow();
            setMessage({ ok: res.ok, text: res.message });
          })
        }
      >
        {pending ? "Güncelleniyor…" : "Şimdi güncelle"}
      </button>
    </span>
  );
}
