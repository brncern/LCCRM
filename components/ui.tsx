import type { ReactNode } from "react";
import type { Channel } from "@/lib/types";

export function PageHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="stack">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title">{title}</h1>
      </div>
      {children ? <div className="toolbar">{children}</div> : null}
    </header>
  );
}

export function SampleBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="pill pill--sample" title="Henüz gerçek veri kaynağı bağlı değil">
      Örnek veri
    </span>
  );
}

export type Tone = "up" | "down" | "warn" | "neutral";

export function Kpi({ label, value, note, tone = "neutral" }: { label: string; value: string; note?: string; tone?: Tone }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {note ? <span className={`kpi-note ${tone === "neutral" ? "" : `tone-${tone}`}`}>{note}</span> : null}
    </div>
  );
}

export function Card({
  title,
  action,
  list,
  children,
  labelledBy,
}: {
  title?: string;
  action?: ReactNode;
  list?: boolean;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section className={`card ${list ? "card--list" : ""}`} aria-labelledby={labelledBy}>
      {title || action ? (
        <div className="card-head">
          {title ? (
            <h2 className="card-title" id={labelledBy}>
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const CHANNEL_META: Record<Channel, { short: string; name: string; color: string }> = {
  instagram: { short: "IG", name: "Instagram", color: "var(--ch-instagram)" },
  messenger: { short: "FB", name: "Messenger", color: "var(--ch-messenger)" },
  whatsapp: { short: "WA", name: "WhatsApp", color: "var(--ch-whatsapp)" },
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
}

export function Avatar({
  name,
  channel,
  size,
  badgeBorder,
}: {
  name: string;
  channel?: Channel;
  size?: "sm" | "lg";
  badgeBorder?: string;
}) {
  const ch = channel ? CHANNEL_META[channel] : null;
  return (
    <span className={`avatar ${size ? `avatar--${size}` : ""}`} aria-hidden="true">
      {initials(name)}
      {ch ? (
        <span className="ch-badge" style={{ background: ch.color, borderColor: badgeBorder ?? "#fff" }}>
          {ch.short}
        </span>
      ) : null}
    </span>
  );
}
