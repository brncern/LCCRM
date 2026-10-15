import { LineChart } from "@/components/charts";
import { IconExternal } from "@/components/icons";
import { Kpi, PageHead, SampleBadge } from "@/components/ui";
import { getSystem, RANGE_DAYS } from "@/lib/data";
import { num, pct } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sistem" };

function axisLabels(): [string, string, string] {
  const f = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
  const now = new Date();
  const start = new Date(now.getTime() - (RANGE_DAYS - 1) * 86_400_000);
  const mid = new Date(now.getTime() - Math.floor(RANGE_DAYS / 2) * 86_400_000);
  return [f(start), f(mid), f(now)];
}

export default async function SystemPage() {
  const { data, sample } = await getSystem();
  const s = data.status;
  const grafana = process.env.GRAFANA_URL;
  const labels = axisLabels();

  return (
    <main className="content">
      <PageHead eyebrow="Ürün ve altyapı · kaynak Grafana" title="Sistem">
        <SampleBadge show={sample} />
        {grafana ? (
          <a href={grafana} target="_blank" rel="noreferrer" className="btn btn--plain" style={{ fontSize: 13, minHeight: 34 }}>
            Grafana&apos;da aç <IconExternal />
          </a>
        ) : null}
      </PageHead>

      <section aria-label="Durum" className="grid grid--kpi">
        <Kpi label="Çalışma süresi" value={pct(s.uptime, 2)} note={`Son kesinti ${s.lastIncident}`} />
        <Kpi label="Aktif kullanıcı" value={num(s.activeUsers)} note={`${s.activeUsersDelta >= 0 ? "↑" : "↓"} ${pct(Math.abs(s.activeUsersDelta), 0)} dünden`} tone={s.activeUsersDelta >= 0 ? "up" : "down"} />
        <Kpi label="Sohbet (bugün)" value={num(s.chatsToday)} note={`Kullanıcı başına ${num(s.chatsToday / Math.max(1, s.activeUsers), 1)}`} />
        <Kpi
          label="Yanıt süresi p95"
          value={`${num(s.latencyP95, 1)} sn`}
          note={s.latencyP95 > s.latencyTarget ? `Hedef ${num(s.latencyTarget, 1)} sn üstünde` : `Hedef ${num(s.latencyTarget, 1)} sn`}
          tone={s.latencyP95 > s.latencyTarget ? "warn" : "neutral"}
        />
        <Kpi label="Hata oranı" value={pct(s.errorRate)} note={`Eşik ${pct(s.errorThreshold, 0)}`} tone={s.errorRate > s.errorThreshold ? "down" : "neutral"} />
      </section>

      <div className="grid grid--2">
        {data.series.map((series) => (
          <section key={series.key} className="card" aria-label={series.title} style={{ gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div className="stack">
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{series.title}</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--label-secondary)" }}>{series.source}</span>
              </div>
              <span className="tabular" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                {num(series.values[series.values.length - 1]!, series.unit ? 1 : 0)}
              </span>
            </div>
            <LineChart series={series} labels={labels} />
          </section>
        ))}
      </div>

      <section
        aria-labelledby="link-h"
        style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.10), rgba(175,82,222,0.08))", borderRadius: 18, boxShadow: "0 0 0 0.5px rgba(0,0,0,0.06)", padding: "18px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 36px" }}
      >
        <h2 id="link-h" className="card-title" style={{ flex: "1 1 240px" }}>Reklam ve ürün bağlantısı</h2>
        {[
          ["Reklamdan gelen yeni kayıt", pct(s.paidShareFromAds, 0)],
          ["Organik yeni kayıt", pct(1 - s.paidShareFromAds, 0)],
          ["7. gün tutma · reklam / organik", `${pct(s.retentionAds, 0)} / ${pct(s.retentionOrganic, 0)}`],
        ].map(([label, value]) => (
          <div key={label} className="stack">
            <span style={{ fontSize: 12, color: "var(--label-2)" }}>{label}</span>
            <span className="tabular" style={{ fontSize: 22, fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
