import type { DailySpend, FunnelStep, MetricSeries } from "@/lib/types";
import { dayOfMonth, money, num, pct } from "@/lib/format";

export function SpendBars({ days, height = 200 }: { days: DailySpend[]; height?: number }) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.meta, d.google))) * 1.1;
  const avgMeta = days.reduce((a, d) => a + d.meta, 0) / Math.max(1, days.length);
  const avgGoogle = days.reduce((a, d) => a + d.google, 0) / Math.max(1, days.length);
  return (
    <>
      <div
        className="bars"
        role="img"
        aria-label={`${days.length} günlük harcama: Meta günde ortalama ${money(avgMeta)}, Google ${money(avgGoogle)}`}
        style={{ height: height + 10, paddingTop: 6 }}
      >
        {days.map((d) => (
          <div key={d.date} className="bars-col" style={{ height }} title={`${d.date} · Meta ${money(d.meta)} · Google ${money(d.google)}`}>
            <div className="bar" style={{ background: "var(--blue)", height: `${(d.meta / max) * 100}%` }} />
            <div className="bar" style={{ background: "var(--orange)", height: `${(d.google / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="axis" style={{ marginTop: -6 }} aria-hidden="true">
        {days.map((d) => (
          <span key={d.date}>{dayOfMonth(d.date)}</span>
        ))}
      </div>
    </>
  );
}

const FUNNEL_COLORS = ["#007AFF", "#2B8CFF", "#4F9EFF", "#74B1FF", "#FF9F0A", "#34C759"];

/** Huni: bar genişlikleri log ölçekli (412.000 ile 27 aynı ekranda okunabilsin), oranlar bir önceki adıma göre. */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  const logTop = Math.log10(top + 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1]!.value : null;
        const width = Math.max(6, (Math.log10(s.value + 1) / logTop) * 100);
        const last = i === steps.length - 1;
        return (
          <div
            key={s.label}
            style={{ display: "grid", gridTemplateColumns: "84px minmax(0,1fr) 70px 52px", alignItems: "center", gap: 12, fontSize: 13 }}
          >
            <span style={{ color: "var(--label-2)", fontWeight: last ? 600 : 400 }}>{s.label}</span>
            <div className="track">
              <div style={{ width: `${width}%`, background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }} />
            </div>
            <span className="tabular" style={{ textAlign: "right", fontWeight: 600 }}>
              {num(s.value)}
            </span>
            <span className="tabular" style={{ textAlign: "right", fontSize: 12, color: "var(--label-secondary)" }}>
              {prev ? pct(s.value / prev) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ series, labels }: { series: MetricSeries; labels: [string, string, string] }) {
  const vals = series.values;
  const lo = Math.min(...vals, series.threshold ?? Infinity);
  const hi = Math.max(...vals, series.threshold ?? -Infinity);
  const pad = (hi - lo) * 0.15 || 1;
  const min = Math.max(0, lo - pad);
  const max = hi + pad;
  const y = (v: number) => (1 - (v - min) / (max - min)) * 92 + 4;
  const pts = vals.map((v, i) => `${Math.round((i / (vals.length - 1)) * 300)},${y(v).toFixed(1)}`).join(" ");
  const gid = `grad-${series.key}`;
  const first = vals[0]!;
  const lastV = vals[vals.length - 1]!;
  return (
    <>
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${series.title}: ${num(first, 1)} değerinden ${num(lastV, 1)} değerine${series.threshold !== undefined ? `, eşik ${num(series.threshold, 1)}` : ""}`}
        style={{ width: "100%", height: 150, display: "block" }}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={series.color} stopOpacity="0.22" />
            <stop offset="1" stopColor={series.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2="300" y2={gy} stroke="rgba(60,60,67,0.10)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {series.threshold !== undefined ? (
          <line
            x1="0"
            y1={y(series.threshold)}
            x2="300"
            y2={y(series.threshold)}
            stroke="#FF3B30"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <polygon points={`0,100 ${pts} 300,100`} fill={`url(#${gid})`} />
        <polyline
          points={pts}
          fill="none"
          stroke={series.color}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--label-secondary)" }}>
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </>
  );
}

export function MiniBars({ values, color, height = 46 }: { values: number[]; color: string; height?: number }) {
  const max = Math.max(1, ...values);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }} aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} style={{ flex: "1 1 0", borderRadius: 999, background: color, height: Math.max(5, (v / max) * height) }} />
      ))}
    </div>
  );
}
