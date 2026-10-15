/**
 * Meta Marketing API senkronu: kampanyalar + kampanya bazında günlük metrikler.
 * Gerekli ortam değişkenleri: META_ACCESS_TOKEN (sistem kullanıcısı, ads_read), META_AD_ACCOUNT_ID (act_...).
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

/** Meta'nın "lead" saydığı eylemler: form lead'i ve mesajlaşma başlatma. */
const LEAD_ACTIONS = new Set([
  "lead",
  "onsite_conversion.lead_grouped",
  "onsite_conversion.messaging_conversation_started_7d",
]);

export type CampaignRow = {
  id: string;
  platform: "meta";
  external_id: string;
  name: string;
  status: "active" | "limited" | "paused" | "removed";
};

export type MetricRow = {
  campaign_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  platform_leads: number;
};

type Paged<T> = { data: T[]; paging?: { next?: string } };
type GraphError = { error?: { message?: string; type?: string; code?: number } };

async function graphGetAll<T>(url: string): Promise<T[]> {
  const out: T[] = [];
  let next: string | undefined = url;
  let guard = 0;
  while (next && guard < 50) {
    guard += 1;
    const res: Response = await fetch(next, { cache: "no-store" });
    const body = (await res.json()) as Paged<T> & GraphError;
    if (!res.ok || body.error) {
      throw new Error(`Meta API: ${body.error?.message ?? res.statusText}`);
    }
    out.push(...(body.data ?? []));
    next = body.paging?.next;
  }
  return out;
}

function mapStatus(effective: string): CampaignRow["status"] {
  switch (effective) {
    case "ACTIVE":
      return "active";
    case "PAUSED":
    case "CAMPAIGN_PAUSED":
    case "ADSET_PAUSED":
      return "paused";
    case "DELETED":
    case "ARCHIVED":
      return "removed";
    default:
      return "limited"; // WITH_ISSUES, IN_PROCESS, PENDING_REVIEW, DISAPPROVED ...
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchMeta(days = 30): Promise<{ campaigns: CampaignRow[]; metrics: MetricRow[] }> {
  const token = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID;
  if (!token || !account) throw new Error("META_ACCESS_TOKEN ve META_AD_ACCOUNT_ID gerekli");
  const act = account.startsWith("act_") ? account : `act_${account}`;
  const auth = `access_token=${encodeURIComponent(token)}`;

  const rawCampaigns = await graphGetAll<{ id: string; name: string; effective_status: string }>(
    `${GRAPH}/${act}/campaigns?fields=id,name,effective_status&limit=200&${auth}`,
  );

  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86_400_000);
  const timeRange = encodeURIComponent(JSON.stringify({ since: isoDate(since), until: isoDate(until) }));
  const rawInsights = await graphGetAll<{
    campaign_id: string;
    campaign_name: string;
    date_start: string;
    spend?: string;
    impressions?: string;
    clicks?: string;
    actions?: Array<{ action_type: string; value: string }>;
  }>(
    `${GRAPH}/${act}/insights?level=campaign&time_increment=1&time_range=${timeRange}` +
      `&fields=campaign_id,campaign_name,spend,impressions,clicks,actions&limit=500&${auth}`,
  );

  const campaigns = new Map<string, CampaignRow>();
  for (const c of rawCampaigns) {
    campaigns.set(c.id, { id: `meta:${c.id}`, platform: "meta", external_id: c.id, name: c.name, status: mapStatus(c.effective_status) });
  }

  const metrics: MetricRow[] = rawInsights.map((r) => {
    // Silinmiş/arşivlenmiş kampanyaların geçmiş harcaması da kaybolmasın
    if (!campaigns.has(r.campaign_id)) {
      campaigns.set(r.campaign_id, { id: `meta:${r.campaign_id}`, platform: "meta", external_id: r.campaign_id, name: r.campaign_name, status: "removed" });
    }
    const leads = (r.actions ?? [])
      .filter((a) => LEAD_ACTIONS.has(a.action_type))
      .reduce((sum, a) => sum + Number(a.value || 0), 0);
    return {
      campaign_id: `meta:${r.campaign_id}`,
      date: r.date_start,
      spend: Number(r.spend ?? 0),
      impressions: Number(r.impressions ?? 0),
      clicks: Number(r.clicks ?? 0),
      platform_leads: leads,
    };
  });

  return { campaigns: [...campaigns.values()], metrics };
}
