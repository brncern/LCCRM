import { supabaseAdmin, supabaseAdminConfigured } from "../supabase/admin";
import { fetchMeta } from "./meta";

export type SyncResult = { source: string; ok: boolean; campaigns?: number; days?: number; error?: string };

async function logRun(source: string, startedAt: string, ok: boolean, error?: string) {
  await supabaseAdmin()
    .from("sync_runs")
    .insert({ source, started_at: startedAt, finished_at: new Date().toISOString(), ok, error: error ?? null });
}

export async function syncMeta(): Promise<SyncResult> {
  const startedAt = new Date().toISOString();
  try {
    const { campaigns, metrics } = await fetchMeta(30);
    const db = supabaseAdmin();
    if (campaigns.length) {
      const { error } = await db
        .from("ad_campaigns")
        .upsert(campaigns.map((c) => ({ ...c, updated_at: new Date().toISOString() })), { onConflict: "id" });
      if (error) throw new Error(`ad_campaigns: ${error.message}`);
    }
    for (let i = 0; i < metrics.length; i += 500) {
      const { error } = await db.from("ad_daily_metrics").upsert(metrics.slice(i, i + 500), { onConflict: "campaign_id,date" });
      if (error) throw new Error(`ad_daily_metrics: ${error.message}`);
    }
    await logRun("meta", startedAt, true);
    return { source: "meta", ok: true, campaigns: campaigns.length, days: new Set(metrics.map((m) => m.date)).size };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await logRun("meta", startedAt, false, message).catch(() => undefined);
    return { source: "meta", ok: false, error: message };
  }
}

/** Ayarlı olan tüm kaynakları senkronlar. */
export async function syncAll(): Promise<SyncResult[]> {
  if (!supabaseAdminConfigured()) {
    return [{ source: "supabase", ok: false, error: "SUPABASE_SERVICE_ROLE_KEY eksik" }];
  }
  const results: SyncResult[] = [];
  if (process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID) results.push(await syncMeta());
  return results;
}

export async function lastSync(): Promise<{ source: string; finishedAt: string; ok: boolean; error: string | null } | null> {
  if (!supabaseAdminConfigured()) return null;
  const { data } = await supabaseAdmin()
    .from("sync_runs")
    .select("source, finished_at, ok, error")
    .order("finished_at", { ascending: false })
    .limit(1);
  const row = (data as unknown as Array<{ source: string; finished_at: string; ok: boolean; error: string | null }> | null)?.[0];
  return row ? { source: row.source, finishedAt: row.finished_at, ok: row.ok, error: row.error } : null;
}
