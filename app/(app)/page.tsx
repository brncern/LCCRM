import Link from "next/link";
import { Funnel, SpendBars } from "@/components/charts";
import { IconWarning } from "@/components/icons";
import { Avatar, Card, Kpi, PageHead, SampleBadge } from "@/components/ui";
import { getOverview, getSocial, RANGE_DAYS } from "@/lib/data";
import { longToday, money, num, pct, since, waitTone } from "@/lib/format";
import type { FunnelStep } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [{ data: o, sample }, social] = await Promise.all([getOverview(), getSocial()]);

  const cpl = o.leads ? o.spend.total / o.leads : null;
  const cpc = o.customers ? o.spend.total / o.customers : null;
  const conv = o.leads ? o.customers / o.leads : null;

  const sp = o.sampleParts;
  // Huniye sadece gerçek veri olan adımlar girer (örnek veriyle gerçek veriyi karıştırma)
  const mixed = !sp.ads;
  const steps: FunnelStep[] = [
    { label: "Gösterim", value: o.impressions },
    { label: "Tıklama", value: o.clicks },
    ...(mixed && sp.inbox ? [] : [{ label: "Mesaj", value: o.messagesFromAds }]),
    { label: "Lead", value: o.leads },
    ...(mixed && sp.crm ? [] : [{ label: "Nitelikli", value: o.qualified }, { label: "Abone", value: o.customers }]),
  ];
  const showCustomers = !(mixed && sp.crm);
  // Mesajdan sonraki adımlar arasında en düşük geçiş oranı = darboğaz
  let worst: { from: string; to: string; rate: number } | null = null;
  for (let i = 3; i < steps.length; i++) {
    const prev = steps[i - 1]!.value;
    if (!prev) continue;
    const rate = steps[i]!.value / prev;
    if (!worst || rate < worst.rate) worst = { from: steps[i - 1]!.label, to: steps[i]!.label, rate };
  }

  const totalReach = social.data.accounts.reduce((a, s) => a + s.reach, 0);

  return (
    <main className="content">
      <PageHead eyebrow={longToday()} title="Genel Bakış">
        <SampleBadge show={sample} />
        <span className="pill pill--blue">Son {RANGE_DAYS} gün</span>
      </PageHead>

      <section aria-label="Temel metrikler" className="grid grid--kpi">
        <Kpi label="Reklam harcaması" value={money(o.spend.total)} note={`Meta ${money(o.spend.meta)} · Google ${money(o.spend.google)}`} />
        <Kpi label="Lead" value={num(o.leads)} note={o.leadsFrom === "platform" ? "Meta'nın saydığı (form + mesaj)" : "CRM'e düşen kişiler"} />
        <Kpi label="Lead başına maliyet" value={cpl ? money(cpl, 1) : "—"} />
        <Kpi
          label="Yeni ücretli abone"
          value={showCustomers ? num(o.customers) : "—"}
          note={showCustomers ? (cpc ? `Abone başına ${money(cpc)}` : undefined) : "Ödeme verisi 4. aşamada"}
        />
        <Kpi label="Lead → abone" value={showCustomers && conv !== null ? pct(conv) : "—"} />
      </section>

      <div className="grid grid--2">
        <Card title="Günlük harcama" labelledBy="spend-h" action={
          <div className="legend">
            <span><span className="dot" style={{ background: "var(--blue)" }} />Meta</span>
            <span><span className="dot" style={{ background: "var(--orange)" }} />Google</span>
          </div>
        }>
          <SpendBars days={o.daily} />
        </Card>

        <Card title={showCustomers ? "Reklamdan aboneye" : "Reklamdan lead'e"} labelledBy="funnel-h" action={<span className="kpi-note">adım dönüşümü</span>}>
          <Funnel steps={steps} />
          {worst ? (
            <div className="callout">
              <IconWarning style={{ color: "var(--orange-text)", flex: "none", marginTop: 1 }} />
              <span>
                Darboğaz {worst.from.toLocaleLowerCase("tr-TR")} → {worst.to.toLocaleLowerCase("tr-TR")}: geçiş oranı {pct(worst.rate)}.
              </span>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="grid grid--3">
        <Card
          title="Yanıt bekleyenler"
          labelledBy="wait-h"
          list
          action={
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SampleBadge show={sp.inbox && !sp.ads} />
              <Link href="/inbox" className="card-link">Tümü</Link>
            </span>
          }
        >
          {o.waiting.length === 0 ? <p className="kpi-note">Bekleyen mesaj yok.</p> : null}
          {o.waiting.map((c) => {
            const last = c.messages[c.messages.length - 1]!;
            const tone = waitTone(c.lastMessageAt);
            return (
              <Link key={c.id} href={`/inbox?c=${c.id}`} className="row" style={{ gridTemplateColumns: "38px minmax(0,1fr) auto", color: "inherit" }}>
                <Avatar name={c.name} channel={c.channel} />
                <span className="stack">
                  <span className="row-title">{c.name}</span>
                  <span className="row-sub">{last.text}</span>
                </span>
                <span className={`tabular ${tone === "neutral" ? "kpi-note" : `tone-${tone}`}`} style={{ fontSize: 12, fontWeight: 600 }}>
                  {since(c.lastMessageAt)}
                </span>
              </Link>
            );
          })}
        </Card>

        <Card title="En iyi kampanyalar" labelledBy="camp-h" list action={<Link href="/ads" className="card-link">Tümü</Link>}>
          {o.topCampaigns.map((c) => (
            <div key={c.id} className="row" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span className="dot" style={{ width: 8, height: 8, background: c.platform === "meta" ? "var(--blue)" : "var(--orange)" }} />
                <span className="stack">
                  <span style={{ fontSize: 14, fontWeight: 500 }} className="row-sub">{c.name}</span>
                  <span className="kpi-note">
                    {num(c.leads)} lead · LBM {c.leads ? money(c.spend / c.leads) : "—"}
                  </span>
                </span>
              </span>
              <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>
                {showCustomers ? (
                  <>
                    {num(c.customers)} <span className="kpi-note" style={{ fontWeight: 400 }}>abone</span>
                  </>
                ) : (
                  money(c.spend)
                )}
              </span>
            </div>
          ))}
        </Card>

        <Card
          title="Sosyal medya"
          labelledBy="soc-h"
          list
          action={
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SampleBadge show={social.sample && !sp.ads} />
              <Link href="/social" className="card-link">Detay</Link>
            </span>
          }
        >
          {social.data.accounts.map((a) => {
            const gained = a.dailyNewFollowers.reduce((x, y) => x + y, 0);
            return (
              <div key={a.network} className="row" style={{ gridTemplateColumns: "1fr auto", padding: "12px 0" }}>
                <span style={{ fontSize: 14 }}>{a.name}</span>
                <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{num(a.followers)}</span>
                  <span className="tone-up" style={{ fontSize: 12 }}>+{num(gained)}</span>
                </span>
              </div>
            );
          })}
          <div className="row" style={{ gridTemplateColumns: "1fr auto", padding: "12px 0" }}>
            <span style={{ fontSize: 14 }}>Toplam erişim ({RANGE_DAYS} gün)</span>
            <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{num(totalReach)}</span>
          </div>
        </Card>
      </div>
    </main>
  );
}
