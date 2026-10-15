"use server";

import { revalidatePath } from "next/cache";
import { supabaseConfigured, supabaseServer } from "@/lib/supabase/server";
import { LEAD_STAGES, type LeadStage } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateLeadStage(leadId: string, stage: LeadStage): Promise<ActionResult> {
  if (!LEAD_STAGES.includes(stage)) return { ok: false, error: "Geçersiz aşama" };
  if (!supabaseConfigured()) return { ok: false, error: "Örnek veri modunda değişiklik kaydedilmez." };

  const client = await supabaseServer();
  const { error } = await client
    .from("leads")
    .update({ stage, converted_at: stage === "customer" ? new Date().toISOString() : null })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** "Şimdi güncelle" düğmesi: reklam verisini hemen çeker. Giriş kontrolünü middleware yapar. */
export async function syncNow(): Promise<{ ok: boolean; message: string }> {
  const { syncAll } = await import("@/lib/sync");
  const results = await syncAll();
  if (results.length === 0) return { ok: false, message: "Bağlı reklam kaynağı yok (erişim anahtarı eksik)." };
  revalidatePath("/", "layout");
  const failed = results.filter((r) => !r.ok);
  if (failed.length) return { ok: false, message: failed.map((r) => `${r.source}: ${r.error}`).join(" · ") };
  return {
    ok: true,
    message: results.map((r) => `${r.source === "meta" ? "Meta" : r.source}: ${r.campaigns} kampanya, ${r.days} gün`).join(" · "),
  };
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true };
  const client = await supabaseServer();
  const { error } = await client.from("conversations").update({ unread: false }).eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
