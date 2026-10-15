/**
 * Veri katmanı. Her fonksiyon Supabase bağlıysa gerçek veriyi, değilse (ya da tablo boşsa)
 * örnek veriyi döndürür ve `sample: true` ile işaretler — ekranlar "Örnek veri" etiketini buna göre gösterir.
 */
import { supabaseConfigured, supabaseServer } from "../supabase/server";
import type {
  Campaign,
  Channel,
  Conversation,
  DailySpend,
  Lead,
  LeadSource,
  LeadStage,
  Loaded,
  MetricSeries,
  PlannedPost,
  SocialAccount,
  SystemStatus,
  TopPost,
} from "../types";
import {
  SAMPLE_CAMPAIGNS,
  SAMPLE_LOST_REASONS,
  SAMPLE_MESSAGES_FROM_ADS,
  SAMPLE_PLANNED,
  SAMPLE_QUALIFIED,
  SAMPLE_SERIES,
  SAMPLE_SOCIAL,
  SAMPLE_STAGE_TOTALS,
  SAMPLE_SYSTEM,
  SAMPLE_TOP_POSTS,
  sampleConversations,
  sampleDailySpend,
  sampleLeads,
} from "./sample";

export const RANGE_DAYS = 14;
const DAY = 86_400_000;

function rangeStart(days = RANGE_DAYS): string {
  return new Date(Date.now() - (days - 1) * DAY).toISOString().slice(0, 10);
}

async function db() {
  if (!supabaseConfigured()) return null;
  try {
    return await supabaseServer();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Reklam harcaması                                                    */
/* ------------------------------------------------------------------ */

type MetricRow = {
  campaign_id: string;
  date: string;
  spend: number | string;
  impressions: number;
  clicks: number;
  ad_campaigns: { platform: "meta" | "google"; name: string; status: Campaign["status"] } | null;
};

async function loadMetricRows(): Promise<MetricRow[] | null> {
  const client = await db();
  if (!client) return null;
  const { data, error } = await client
    .from("ad_daily_metrics")
    .select("campaign_id, date, spend, impressions, clicks, ad_campaigns(platform, name, status)")
    .gte("date", rangeStart());
  if (error || !data || data.length === 0) return null;
  return data as unknown as MetricRow[];
}

export async function getDailySpend(): Promise<Loaded<DailySpend[]>> {
  const rows = await loadMetricRows();
  if (!rows) return { data: sampleDailySpend(), sample: true };

  const byDay = new Map<string, DailySpend>();
  for (let i = RANGE_DAYS - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    byDay.set(date, { date, meta: 0, google: 0 });
  }
  for (const r of rows) {
    const day = byDay.get(r.date);
    const platform = r.ad_campaigns?.platform;
    if (!day || !platform) continue;
    day[platform] += Number(r.spend);
  }
  return { data: [...byDay.values()], sample: false };
}

export async function getCampaigns(): Promise<Loaded<Campaign[]>> {
  const rows = await loadMetricRows();
  if (!rows) return { data: SAMPLE_CAMPAIGNS, sample: true };

  const map = new Map<string, Campaign>();
  for (const r of rows) {
    if (!r.ad_campaigns) continue;
    const c =
      map.get(r.campaign_id) ??
      ({
        id: r.campaign_id,
        platform: r.ad_campaigns.platform,
        name: r.ad_campaigns.name,
        status: r.ad_campaigns.status,
        spend: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        customers: 0,
      } satisfies Campaign);
    c.spend += Number(r.spend);
    c.impressions += r.impressions;
    c.clicks += r.clicks;
    map.set(r.campaign_id, c);
  }

  // Lead ve müşteri sayıları CRM'deki lead'lerden gelir (reklam platformunun saydığı değil).
  const client = await db();
  if (client) {
    const { data } = await client
      .from("leads")
      .select("campaign_id, stage")
      .gte("created_at", rangeStart())
      .not("campaign_id", "is", null);
    for (const l of (data ?? []) as unknown as Array<{ campaign_id: string; stage: LeadStage }>) {
      const c = map.get(l.campaign_id);
      if (!c) continue;
      c.leads += 1;
      if (l.stage === "customer") c.customers += 1;
    }
  }

  return { data: [...map.values()].sort((a, b) => b.leads - a.leads), sample: false };
}

/* ------------------------------------------------------------------ */
/* Gelen kutusu                                                        */
/* ------------------------------------------------------------------ */

type ConversationRow = {
  id: string;
  lead_id: string | null;
  channel: Channel;
  contact_name: string;
  ad_name: string | null;
  unread: boolean;
  first_contact_at: string;
  last_message_at: string;
  leads: { stage: LeadStage; topic: string; ad_campaigns: { name: string } | null } | null;
  messages: Array<{ id: string; from_me: boolean; body: string; sent_at: string }>;
};

export async function getConversations(): Promise<Loaded<Conversation[]>> {
  const client = await db();
  if (client) {
    const { data, error } = await client
      .from("conversations")
      .select(
        "id, lead_id, channel, contact_name, ad_name, unread, first_contact_at, last_message_at, leads(stage, topic, ad_campaigns(name)), messages(id, from_me, body, sent_at)",
      )
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (!error && data && data.length > 0) {
      const rows = data as unknown as ConversationRow[];
      return {
        sample: false,
        data: rows.map((r) => ({
          id: r.id,
          leadId: r.lead_id,
          name: r.contact_name,
          channel: r.channel,
          topic: r.leads?.topic ?? "",
          campaignName: r.leads?.ad_campaigns?.name ?? null,
          adName: r.ad_name,
          stage: r.leads?.stage ?? "new",
          unread: r.unread,
          firstContactAt: r.first_contact_at,
          lastMessageAt: r.last_message_at,
          messages: [...r.messages]
            .sort((a, b) => a.sent_at.localeCompare(b.sent_at))
            .map((m) => ({ id: m.id, fromMe: m.from_me, text: m.body, sentAt: m.sent_at })),
        })),
      };
    }
  }
  return { data: sampleConversations(), sample: true };
}

/** Yanıt bekleyenler: okunmamış ve son mesajı karşı taraftan gelen konuşmalar, en yenisi önce. */
export function waitingOf(conversations: Conversation[]): Conversation[] {
  return conversations
    .filter((c) => c.unread && c.messages.length > 0 && !c.messages[c.messages.length - 1]!.fromMe)
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

/* ------------------------------------------------------------------ */
/* Lead hattı                                                          */
/* ------------------------------------------------------------------ */

export type LeadBoard = {
  leads: Lead[];
  totals: Record<Exclude<LeadStage, "lost">, number>;
  lost: Array<{ reason: string; count: number }>;
};

type LeadRow = {
  id: string;
  name: string;
  topic: string;
  channel: Channel | null;
  source: LeadSource;
  stage: LeadStage;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
  ad_campaigns: { name: string } | null;
};

export async function getLeadBoard(): Promise<Loaded<LeadBoard>> {
  const client = await db();
  if (client) {
    const { data, error } = await client
      .from("leads")
      .select("id, name, topic, channel, source, stage, lost_reason, created_at, updated_at, ad_campaigns(name)")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (!error && data && data.length > 0) {
      const rows = data as unknown as LeadRow[];
      const leads: Lead[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        topic: r.topic,
        channel: r.channel,
        source: r.source,
        campaignName: r.ad_campaigns?.name ?? null,
        stage: r.stage,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lostReason: r.lost_reason,
      }));
      const totals = { new: 0, contacted: 0, qualified: 0, proposal: 0, customer: 0 };
      const lostMap = new Map<string, number>();
      const since = rangeStart();
      for (const l of leads) {
        if (l.stage === "lost") {
          if (l.updatedAt.slice(0, 10) >= since) {
            const key = l.lostReason || "Belirtilmedi";
            lostMap.set(key, (lostMap.get(key) ?? 0) + 1);
          }
        } else {
          totals[l.stage] += 1;
        }
      }
      return {
        sample: false,
        data: {
          leads: leads.filter((l) => l.stage !== "lost"),
          totals,
          lost: [...lostMap.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
        },
      };
    }
  }
  return {
    sample: true,
    data: { leads: sampleLeads(), totals: { ...SAMPLE_STAGE_TOTALS }, lost: SAMPLE_LOST_REASONS },
  };
}

/* ------------------------------------------------------------------ */
/* Genel bakış                                                         */
/* ------------------------------------------------------------------ */

export type Overview = {
  spend: { total: number; meta: number; google: number };
  leads: number;
  customers: number;
  messagesFromAds: number;
  qualified: number;
  impressions: number;
  clicks: number;
  daily: DailySpend[];
  topCampaigns: Campaign[];
  waiting: Conversation[];
};

export async function getOverview(): Promise<Loaded<Overview>> {
  const [daily, campaigns, conversations, board] = await Promise.all([
    getDailySpend(),
    getCampaigns(),
    getConversations(),
    getLeadBoard(),
  ]);
  const c = campaigns.data;
  const sum = (f: (x: Campaign) => number) => c.reduce((a, x) => a + f(x), 0);
  const meta = c.filter((x) => x.platform === "meta").reduce((a, x) => a + x.spend, 0);
  const google = c.filter((x) => x.platform === "google").reduce((a, x) => a + x.spend, 0);

  const allSample = campaigns.sample;
  const qualified = allSample
    ? SAMPLE_QUALIFIED
    : board.data.totals.qualified + board.data.totals.proposal + board.data.totals.customer;
  const messagesFromAds = allSample
    ? SAMPLE_MESSAGES_FROM_ADS
    : conversations.data.filter((x) => x.adName).length;

  return {
    sample: daily.sample || campaigns.sample || conversations.sample || board.sample,
    data: {
      spend: { total: meta + google, meta, google },
      leads: sum((x) => x.leads),
      customers: sum((x) => x.customers),
      messagesFromAds,
      qualified,
      impressions: sum((x) => x.impressions),
      clicks: sum((x) => x.clicks),
      daily: daily.data,
      topCampaigns: [...c].sort((a, b) => b.leads - a.leads).slice(0, 4),
      waiting: waitingOf(conversations.data).slice(0, 4),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Sosyal medya ve sistem — 5. aşamada gerçek kaynaklara bağlanacak    */
/* ------------------------------------------------------------------ */

export async function getSocial(): Promise<Loaded<{ accounts: SocialAccount[]; top: TopPost[]; planned: PlannedPost[] }>> {
  return { sample: true, data: { accounts: SAMPLE_SOCIAL, top: SAMPLE_TOP_POSTS, planned: SAMPLE_PLANNED } };
}

export async function getSystem(): Promise<Loaded<{ status: SystemStatus; series: MetricSeries[] }>> {
  return { sample: true, data: { status: SAMPLE_SYSTEM, series: SAMPLE_SERIES } };
}

export function connectionStatus() {
  return [
    { label: "Meta Ads", ok: Boolean(process.env.META_ACCESS_TOKEN) },
    { label: "Google Ads", ok: Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN) },
    { label: "Gelen kutusu", ok: false },
    { label: "Grafana", ok: Boolean(process.env.GRAFANA_TOKEN) },
  ];
}
