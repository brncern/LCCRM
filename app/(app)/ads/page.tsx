import Link from "next/link";
import { SyncButton } from "@/components/sync-button";
import { Card, PageHead, SampleBadge } from "@/components/ui";
import { getCampaigns, RANGE_DAYS } from "@/lib/data";
import { dateTime, money, num, pct } from "@/lib/format";
import { lastSync } from "@/lib/sync";
import type { Campaign, Platform } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reklamlar" };

const TABS: Array<{ id: Platform | "all"; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
];

const PLATFORM = {
  meta: { name: "Meta Ads", letter: "M", bg: "#0066D6", fg: "#FFFFFF", dot: "var(--blue)" },
  google: { name: "Google Ads", letter: "G", bg: "#FF9F0A", fg: "#3D1E00", dot: "var(--orange)" },
} as const;

const STATUS = {
  active: { label: "Aktif", cls: "pill--green" },
  limited: { label: "Sınırlı", cls: "pill--orange" },
  paused: { label: "Duraklatıldı", cls: "pill--blue" },
} as const;

type Advice = { tone: "down" | "warn" | "up"; title: string; text: string };

function advise(campaigns: Campaign[]): Advice[] {
  const out: Advice[] = [];
  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  for (const c of campaigns) {
    if (c.customers === 0 && c.spend > totalSpend * 0.08) {
      out.push({
        tone: "down",
        title: `Para yakıyor · ${PLATFORM[c.platform].name}`,
        text: `${c.name} ${RANGE_DAYS} günde ${money(c.spend)} harcadı, hiç ücretli abone getirmedi. Durdurmayı ya da bütçeyi kaydırmayı düşün.`,
      });
    }
  }
  const withCust = campaigns.filter((c) => c.customers > 0);
  if (withCust.length > 1) {
    const best = [...withCust].sort((a, b) => a.spend / a.customers - b.spend / b.customers)[0]!;
    out.push({
      tone: "up",
      title: "Fırsat",
      text: `${best.name} abone başına ${money(best.spend / best.customers)} ile en verimli kampanya. Bütçe artışı için iyi aday.`,
    });
  }
  return out;
}

export default async function AdsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const [{ data, sample }, params, last] = await Promise.all([getCampaigns(), searchParams, lastSync()]);
  const tab = (TABS.find((t) => t.id === params.p)?.id ?? "all") as Platform | "all";
  const rows = data.filter((c) => tab === "all" || c.platform === tab);

  const platforms = (["meta", "google"] as const)
    .filter((p) => tab === "all" || p === tab)
    .map((p) => {
      const cs = data.filter((c) => c.platform === p);
      const spend = cs.reduce((a, c) => a + c.spend, 0);
      const leads = cs.reduce((a, c) => a + c.leads, 0);
      const customers = cs.reduce((a, c) => a + c.customers, 0);
      const active = cs.filter((c) => c.status === "active").length;
      return { p, spend, leads, customers, active };
    });

  const advice = advise(data);

  return (
    <main className="content">
      <PageHead eyebrow={`Son ${RANGE_DAYS} gün`} title="Reklamlar">
        <SampleBadge show={sample} />
        <SyncButton lastLabel={last?.ok ? dateTime(last.finishedAt) : null} />
        <nav aria-label="Platform" className="segmented">
          {TABS.map((t) => (
            <Link key={t.id} href={t.id === "all" ? "/ads" : `/ads?p=${t.id}`} aria-current={t.id === tab ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      </PageHead>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {platforms.map(({ p, spend, leads, customers, active }) => (
          <section key={p} className="card" aria-label={`${PLATFORM[p].name} özeti`}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 8, background: PLATFORM[p].bg, color: PLATFORM[p].fg, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {PLATFORM[p].letter}
              </span>
              <h2 className="card-title">{PLATFORM[p].name}</h2>
              <span className="kpi-note" style={{ marginLeft: "auto" }}>{active} aktif kampanya</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
              {[
                ["Harcama", money(spend)],
                ["Lead", num(leads)],
                ["LBM", leads ? money(spend / leads) : "—"],
                ["Abone", num(customers)],
              ].map(([label, value]) => (
                <div key={label} className="stack">
                  <span className="kpi-note">{label}</span>
                  <span className="tabular" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card title="Kampanyalar" labelledBy="tbl-h">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kampanya</th>
                <th className="left">Durum</th>
                <th>Harcama</th>
                <th>Gösterim</th>
                <th>Tıklama</th>
                <th>TO</th>
                <th>Lead</th>
                <th>LBM</th>
                <th>Abone</th>
                <th>Abone başına</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const perCust = c.customers ? c.spend / c.customers : null;
                const tone = perCust === null ? "tone-down" : perCust < 1500 ? "tone-up" : "";
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="dot" style={{ width: 8, height: 8, background: PLATFORM[c.platform].dot }} />
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span>
                      </span>
                    </td>
                    <td className="left">
                      <span className={`pill ${STATUS[c.status].cls}`} style={{ padding: "3px 9px" }}>{STATUS[c.status].label}</span>
                    </td>
                    <td>{money(c.spend)}</td>
                    <td>{num(c.impressions)}</td>
                    <td>{num(c.clicks)}</td>
                    <td>{c.impressions ? pct(c.clicks / c.impressions, 2) : "—"}</td>
                    <td>{num(c.leads)}</td>
                    <td>{c.leads ? money(c.spend / c.leads) : "—"}</td>
                    <td>{num(c.customers)}</td>
                    <td className={tone} style={{ fontWeight: 600 }}>{perCust !== null ? money(perCust) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {advice.length > 0 ? (
        <section aria-labelledby="rec-h" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="rec-h" className="card-title">Bu hafta yapılacaklar</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {advice.map((a) => (
              <div key={a.text} className="card" style={{ gap: 10 }}>
                <span className={`tone-${a.tone}`} style={{ fontSize: 13 }}>{a.title}</span>
                <span style={{ fontSize: 14, lineHeight: 1.45 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
