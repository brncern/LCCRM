"use client";

import { useMemo, useState, useTransition } from "react";
import { markConversationRead, updateLeadStage } from "@/app/actions";
import { IconArrowUp, IconSearch } from "@/components/icons";
import { Avatar, CHANNEL_META, SampleBadge } from "@/components/ui";
import { clock, dateTime, since, waitTone } from "@/lib/format";
import { LEAD_STAGES, STAGE_LABEL, type Channel, type Conversation, type LeadStage } from "@/lib/types";

type Filter = "all" | "waiting" | Channel;

const FILTERS: Array<{ id: Filter; label: string; color: string }> = [
  { id: "all", label: "Tümü", color: "var(--gray)" },
  { id: "waiting", label: "Yanıtsız", color: "var(--blue)" },
  { id: "instagram", label: "Instagram", color: "var(--ch-instagram)" },
  { id: "messenger", label: "Messenger", color: "var(--ch-messenger)" },
  { id: "whatsapp", label: "WhatsApp", color: "var(--ch-whatsapp)" },
];

function isWaiting(c: Conversation) {
  const last = c.messages[c.messages.length - 1];
  return c.unread && !!last && !last.fromMe;
}

export function InboxView({
  conversations,
  sample,
  initialId,
}: {
  conversations: Conversation[];
  sample: boolean;
  initialId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [stages, setStages] = useState<Record<string, LeadStage>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const out: Record<Filter, number> = { all: conversations.length, waiting: 0, instagram: 0, messenger: 0, whatsapp: 0 };
    for (const c of conversations) {
      out[c.channel] += 1;
      if (isWaiting(c)) out.waiting += 1;
    }
    return out;
  }, [conversations]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return conversations.filter((c) => {
      if (filter === "waiting" && !isWaiting(c)) return false;
      if (filter !== "all" && filter !== "waiting" && c.channel !== filter) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.topic} ${c.messages.map((m) => m.text).join(" ")}`.toLocaleLowerCase("tr-TR");
      return hay.includes(q);
    });
  }, [conversations, filter, query]);

  const current = conversations.find((c) => c.id === selectedId) ?? visible[0] ?? null;
  const currentStage = current ? stages[current.id] ?? current.stage : "new";

  function select(c: Conversation) {
    setSelectedId(c.id);
    setNotice(null);
    if (c.unread && !sample) startTransition(() => void markConversationRead(c.id));
  }

  function changeStage(stage: LeadStage) {
    if (!current) return;
    setStages((s) => ({ ...s, [current.id]: stage }));
    if (sample || !current.leadId) {
      setNotice(sample ? "Örnek veri modunda değişiklik kaydedilmez." : "Bu konuşma henüz bir lead'e bağlı değil.");
      return;
    }
    const leadId = current.leadId;
    startTransition(async () => {
      const res = await updateLeadStage(leadId, stage);
      setNotice(res.ok ? "Kaydedildi." : res.error);
    });
  }

  return (
    <main className="content content--bare">
      <section aria-label="Konuşmalar" className="pane pane--list">
        <div style={{ padding: "18px 16px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Gelen Kutusu</h1>
            <SampleBadge show={sample} />
          </div>
          <label className="search">
            <IconSearch style={{ color: "var(--label-secondary)" }} />
            <span className="sr-only">Konuşmalarda ara</span>
            <input type="search" placeholder="Ara" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: "1 1 auto", width: "auto" }} />
          </label>
          <div role="group" aria-label="Filtre" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  borderRadius: 999,
                  padding: "0 10px",
                  minHeight: 30,
                  fontSize: 12,
                  fontWeight: filter === f.id ? 600 : 500,
                  background: filter === f.id ? "var(--selection)" : "var(--fill-quaternary)",
                }}
              >
                <span className="dot" style={{ width: 8, height: 8, background: f.color }} />
                {f.label}
                <span className="tabular" style={{ color: "var(--label-secondary)" }}>{counts[f.id]}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "0 8px 8px" }}>
          {visible.length === 0 ? <p className="kpi-note" style={{ padding: "8px 10px" }}>Bu filtrede konuşma yok.</p> : null}
          {visible.map((c) => {
            const on = current?.id === c.id;
            const last = c.messages[c.messages.length - 1];
            const tone = waitTone(c.lastMessageAt);
            return (
              <button key={c.id} type="button" className="thread-item" aria-current={on ? "true" : undefined} onClick={() => select(c)}>
                <span className="dot" style={{ background: c.unread ? "var(--blue)" : "transparent" }} aria-hidden="true" />
                <Avatar name={c.name} channel={c.channel} badgeBorder={on ? "var(--blue-text)" : "var(--surface)"} />
                <span className="stack">
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span className="row-title">
                      {c.name}
                      {c.unread ? <span className="sr-only"> (okunmadı)</span> : null}
                    </span>
                    <span suppressHydrationWarning className={`thread-time${!on && isWaiting(c) && tone !== "neutral" ? `tone-${tone}` : ""}`} style={!on && (tone === "neutral" || !isWaiting(c)) ? { color: "var(--label-secondary)" } : undefined}>
                      {since(c.lastMessageAt)}
                    </span>
                  </span>
                  <span className="row-sub">{last ? (last.fromMe ? `Sen: ${last.text}` : last.text) : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Konuşma" className="pane pane--thread">
        {current ? (
          <>
            <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: "0.5px solid var(--separator)" }}>
              <div className="stack">
                <span style={{ fontSize: 15, fontWeight: 600 }}>{current.name}</span>
                <span className="kpi-note">
                  {CHANNEL_META[current.channel].name} · {current.campaignName ?? "Organik"}
                </span>
              </div>
            </div>
            <div style={{ flex: "1 1 auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {current.adName ? (
                <span style={{ alignSelf: "center", fontSize: 11, fontWeight: 600, color: "var(--label-secondary)", padding: "4px 0 8px" }}>
                  Reklamdan geldi · “{current.adName}”
                </span>
              ) : null}
              {current.messages.map((m) => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "70%", alignSelf: m.fromMe ? "flex-end" : "flex-start" }}>
                  <div className={`bubble ${m.fromMe ? "bubble--out" : "bubble--in"}`}>{m.text}</div>
                  <span className="tabular" style={{ fontSize: 11, color: "var(--label-secondary)", alignSelf: m.fromMe ? "flex-end" : "flex-start", padding: "0 8px" }}>
                    {clock(m.sentAt)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="composer" aria-disabled="true" style={{ opacity: 0.6 }}>
                <label style={{ flex: "1 1 auto", display: "flex", minWidth: 0 }}>
                  <span className="sr-only">Yanıt</span>
                  <input type="text" placeholder="Mesaj" disabled />
                </label>
                <button type="button" className="send" aria-label="Gönder" disabled>
                  <IconArrowUp style={{ color: "#fff" }} />
                </button>
              </div>
              <span className="kpi-note">Buradan yanıt gönderme 3. aşamada (Meta mesajlaşma izinleri onaylanınca) açılacak.</span>
            </div>
          </>
        ) : (
          <p className="kpi-note" style={{ padding: 20 }}>Konuşma seçilmedi.</p>
        )}
      </section>

      {current ? (
        <aside aria-label="Lead kartı" className="pane pane--inspector">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0 4px" }}>
            <Avatar name={current.name} size="lg" />
            <span style={{ fontSize: 17, fontWeight: 600 }}>{current.name}</span>
            <span className="pill pill--blue">{STAGE_LABEL[currentStage]}</span>
          </div>
          <div className="inset-list">
            <div><span className="kpi-note" style={{ fontSize: 13 }}>Konu</span><span style={{ fontWeight: 500, textAlign: "right" }}>{current.topic || "—"}</span></div>
            <div><span className="kpi-note" style={{ fontSize: 13 }}>Kanal</span><span>{CHANNEL_META[current.channel].name}</span></div>
            <div><span className="kpi-note" style={{ fontSize: 13 }}>Kampanya</span><span style={{ textAlign: "right" }}>{current.campaignName ?? "Organik"}</span></div>
            <div><span className="kpi-note" style={{ fontSize: 13 }}>İlk temas</span><span className="tabular">{dateTime(current.firstContactAt)}</span></div>
          </div>
          <label className="field">
            AŞAMA
            <select value={currentStage} onChange={(e) => changeStage(e.target.value as LeadStage)} disabled={pending}>
              {LEAD_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          {notice ? (
            <span role="status" className="kpi-note">
              {notice}
            </span>
          ) : null}
        </aside>
      ) : null}
    </main>
  );
}
