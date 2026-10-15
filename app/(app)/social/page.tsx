import { MiniBars } from "@/components/charts";
import { Card, PageHead, SampleBadge } from "@/components/ui";
import { getSocial, RANGE_DAYS } from "@/lib/data";
import { num, pct } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sosyal Medya" };

const NETWORK = {
  instagram: { short: "IG", color: "#C2185B" },
  facebook: { short: "f", color: "#0866FF" },
  linkedin: { short: "in", color: "#0A66C2" },
} as const;

const KIND_TILE: Record<string, [string, string]> = {
  Reels: ["rgba(255,45,85,0.12)", "#B0003A"],
  Karusel: ["rgba(175,82,222,0.12)", "#7A2BA8"],
  Gönderi: ["rgba(0,122,255,0.12)", "#0058C2"],
  Makale: ["rgba(52,199,89,0.14)", "#1F7A36"],
};

export default async function SocialPage() {
  const { data, sample } = await getSocial();

  return (
    <main className="content">
      <PageHead eyebrow={`Son ${RANGE_DAYS} gün · Meta Business Suite ve LinkedIn`} title="Sosyal Medya">
        <SampleBadge show={sample} />
      </PageHead>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {data.accounts.map((a) => {
          const gained = a.dailyNewFollowers.reduce((x, y) => x + y, 0);
          return (
            <section key={a.network} className="card" aria-label={a.name} style={{ borderRadius: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 8, background: NETWORK[a.network].color, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {NETWORK[a.network].short}
                </span>
                <span className="stack">
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{a.name}</h2>
                  <span className="kpi-note">{a.handle}</span>
                </span>
                <span className="pill pill--green" style={{ marginLeft: "auto", padding: "3px 9px" }}>+{num(gained)}</span>
              </div>
              <div className="stack">
                <span className="kpi-note">Takipçi</span>
                <span className="tabular" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.025em" }}>{num(a.followers)}</span>
              </div>
              <MiniBars values={a.dailyNewFollowers} color="var(--blue)" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, background: "var(--fill-quaternary)", borderRadius: 14, padding: "10px 12px" }}>
                {[
                  ["Erişim", num(a.reach)],
                  ["Etkileşim", pct(a.engagementRate)],
                  ["Gönderi", num(a.posts)],
                ].map(([label, value]) => (
                  <div key={label} className="stack">
                    <span className="kpi-note" style={{ fontSize: 11 }}>{label}</span>
                    <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid grid--2">
        <Card title="En iyi gönderiler" labelledBy="top-h" list>
          {data.top.map((p) => {
            const [bg, fg] = KIND_TILE[p.kind] ?? ["var(--fill-tertiary)", "var(--label)"];
            return (
              <div key={p.title} className="row" style={{ gridTemplateColumns: "52px minmax(0,1fr) auto", gap: 14 }}>
                <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 12, background: bg, color: fg, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.kind}
                </span>
                <span className="stack">
                  <span className="row-sub" style={{ fontSize: 14, fontWeight: 500, color: "var(--label)" }}>{p.title}</span>
                  <span className="kpi-note">{p.network} · {p.date}</span>
                </span>
                <span className="stack" style={{ alignItems: "flex-end" }}>
                  <span className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{num(p.reach)}</span>
                  <span className="kpi-note">{num(p.messages)} mesaj</span>
                </span>
              </div>
            );
          })}
        </Card>

        <Card title="Planlanan" labelledBy="sch-h" list>
          {data.planned.map((s) => (
            <div key={s.title} className="row" style={{ gridTemplateColumns: "22px minmax(0,1fr) auto", padding: "11px 0" }}>
              <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px #C7C7CC" }} />
              <span className="stack">
                <span style={{ fontSize: 14 }}>{s.title}</span>
                <span className="kpi-note">{s.networks}</span>
              </span>
              <span className="tabular" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue-text)" }}>{s.when}</span>
            </div>
          ))}
        </Card>
      </div>
    </main>
  );
}
