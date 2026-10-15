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

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true };
  const client = await supabaseServer();
  const { error } = await client.from("conversations").update({ unread: false }).eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
