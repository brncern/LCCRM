import Link from "next/link";
import { Avatar, PageHead, SampleBadge } from "@/components/ui";
import { getLeadBoard, RANGE_DAYS } from "@/lib/data";
import { num, since } from "@/lib/format";
import { STAGE_LABEL, type LeadSource, type LeadStage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead Hattı" };

const COLUMNS: Array<{ stage: Exclude<LeadStage, "lost">; dot: string }> = [
  { stage: "new", dot: "var(--gray)" },
  { stage: "contacted", dot: "#64D2FF" },
  { stage: "qualified", dot: "var(--blue)" },
  { stage: "proposal", dot: "var(--orange)" },
  { stage: "customer", dot: "var(--green)" },
];

const SOURCES: Array<{ id: LeadSource | "all"; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "organic", label: "Organik" },
];

const SOURCE_PILL: Record<LeadSource, string> = { meta: "pill--blue", google: "pill--orange", organic: "pill--green" };
const LOST_COLORS = ["#8E8E93", "#FF9F0A", "#007AFF", "#C7C7CC", "#AF52DE", "#34C759"];
const PER_COLUMN = 6;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ src?: string }> }) {
  const [{ data, sample }, params] = await Promise.all([getLeadBoard(), searchParams]);
  const src = (SOURCES.find((s) => s.id === params.src)?.id ?? "all") as LeadSource | "all";

  const open = data.totals.new + data.totals.contacted + data.totals.qualified + data.totals.proposal;
  const lostTotal = data.lost.reduce((a, l) => a + l.count, 0);
  const filtered = data.leads.filter((l) => src === "all" || l.source === src);

  return (
    <main className="content">
      <PageHead eyebrow={`${num(open)} açık · ${num(data.totals.customer)} ücretli abone`} title="Lead Hattı">
        <SampleBadge show={sample} />
        <nav aria-label="Kaynak" className="segmented">
          {SOURCES.map((s) => (
            <Link key={s.id} href={s.id === "all" ? "/leads" : `/leads?src=${s.id}`} aria-current={s.id === src ? "page" : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
      </PageHead>

      <div className="kanban-wrap">
        <div className="kanban">
          {COLUMNS.map((col) => {
            const items = filtered.filter((l) => l.stage === col.stage);
            const total = src === "all" ? data.totals[col.stage] : items.length;
            const shown = items.slice(0, PER_COLUMN);
            const more = Math.max(0, total - shown.length);
            return (
              <section key={col.stage} aria-label={STAGE_LABEL[col.stage]} className="lane">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 6px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
                    <span className="dot" style={{ width: 10, height: 10, background: col.dot }} />
                    {STAGE_LABEL[col.stage]}
                  </span>
                  <span className="tabular kpi-note" style={{ fontSize: 13, fontWeight: 600 }}>{num(total)}</span>
                </div>
                {shown.map((l) => {
                  const stale = col.stage !== "customer" && Date.now() - new Date(l.updatedAt).getTime() > 3 * 86_400_000;
                  return (
                    <article key={l.id} className="lead-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={l.name} size="sm" />
                        <span className="stack">
                          <span className="row-title">{l.name}</span>
                          <span style={{ fontSize: 13, color: "var(--label-2)" }}>{l.topic}</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span className={`pill ${SOURCE_PILL[l.source]}`} style={{ fontSize: 11, padding: "2px 8px", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                          {l.campaignName ?? "Organik"}
                        </span>
                        <span className={`tabular ${stale ? "tone-down" : "kpi-note"}`} style={{ fontSize: 12, flex: "none" }}>
                          {since(l.updatedAt)}
                        </span>
                      </div>
                    </article>
                  );
                })}
                {more > 0 ? <span className="kpi-note" style={{ padding: "6px 8px" }}>+{num(more)} daha</span> : null}
              </section>
            );
          })}
        </div>
      </div>

      {lostTotal > 0 ? (
        <section className="card" aria-labelledby="lost-h" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "12px 28px" }}>
          <h2 id="lost-h" className="card-title" style={{ fontSize: 15 }}>
            Kaybedilen ({RANGE_DAYS} gün) <span className="tabular">{num(lostTotal)}</span>
          </h2>
          <div
            role="img"
            aria-label={`Kayıp nedenleri: ${data.lost.map((l) => `${l.reason} ${l.count}`).join(", ")}`}
            style={{ flex: "1 1 360px", display: "flex", height: 10, borderRadius: 999, overflow: "hidden", gap: 2 }}
          >
            {data.lost.map((l, i) => (
              <span key={l.reason} style={{ flex: `${l.count} 1 0`, background: LOST_COLORS[i % LOST_COLORS.length] }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--label-2)" }}>
            {data.lost.map((l, i) => (
              <span key={l.reason} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ width: 8, height: 8, background: LOST_COLORS[i % LOST_COLORS.length] }} />
                {l.reason} {num(l.count)}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
