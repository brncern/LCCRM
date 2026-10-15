"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  IconColumns,
  IconGrid,
  IconInbox,
  IconMegaphone,
  IconPulse,
  IconScale,
  IconShare,
} from "./icons";

type Item = { href: string; label: string; Icon: ComponentType<{ size?: number }>; count?: number };
type Section = { title: string; items: Item[] };

export type ConnectionStatus = { label: string; ok: boolean };

export function Sidebar({ unread, connections }: { unread: number; connections: ConnectionStatus[] }) {
  const pathname = usePathname();

  const sections: Section[] = [
    {
      title: "Genel",
      items: [
        { href: "/", label: "Genel Bakış", Icon: IconGrid },
        { href: "/inbox", label: "Gelen Kutusu", Icon: IconInbox, count: unread },
        { href: "/leads", label: "Lead Hattı", Icon: IconColumns },
      ],
    },
    {
      title: "Kanallar",
      items: [
        { href: "/ads", label: "Reklamlar", Icon: IconMegaphone },
        { href: "/social", label: "Sosyal Medya", Icon: IconShare },
      ],
    },
    {
      title: "Ürün",
      items: [{ href: "/system", label: "Sistem", Icon: IconPulse }],
    },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sidebar" aria-label="Kenar çubuğu">
      <div className="traffic" aria-hidden="true">
        <span style={{ background: "#FF5F57" }} />
        <span style={{ background: "#FEBC2E" }} />
        <span style={{ background: "#28C840" }} />
      </div>
      <div className="app-id">
        <span className="app-icon" aria-hidden="true">
          <IconScale size={18} style={{ color: "#fff" }} />
        </span>
        <span className="stack">
          <span className="app-name">LawChat</span>
          <span className="app-sub">Pazarlama</span>
        </span>
      </div>

      {sections.map((section) => (
        <div key={section.title} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="side-section">{section.title}</span>
          {section.items.map(({ href, label, Icon, count }) => (
            <Link
              key={href}
              href={href}
              className="side-item"
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
              {count ? <span className="side-count">{count}</span> : null}
            </Link>
          ))}
        </div>
      ))}

      <div className="side-status">
        {connections.map((c) => (
          <span key={c.label}>
            <span className="dot" style={{ width: 7, height: 7, background: c.ok ? "var(--green)" : "#AEAEB2" }} />
            {c.label}
          </span>
        ))}
      </div>
    </nav>
  );
}
